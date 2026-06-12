import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginApi, getMyTasks, updateTaskStatusApi, BackendTask, checkHealthApi, addRemarkApi, BASE_URL } from '../services/api';

// ─── Types ─────────────────────────────────────────────

export type TaskType = 'MAINTENANCE' | 'REPAIR' | 'INSPECTION';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  taskName: string;
  equipmentId: string;
  equipmentName: string;
  area: string;
  zone: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  date: string;
  description: string;
  operatorName: string;
  equipmentsList: string[];
}

export interface User {
  username: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

interface AppContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  tasks: Task[];
  isLoadingTasks: boolean;
  isOnline: boolean;
  backendStatus: 'ONLINE' | 'SERVER_DOWN' | 'OFFLINE';
  syncingCount: number;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  fetchTasks: () => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  addRemark: (taskId: string, remarkText: string) => Promise<void>;
  syncOfflineQueue: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── Helper: Mapping ───────────────────────────────────

function mapBackendTask(bt: BackendTask): Task {
  return {
    id: bt.id.toString(),
    taskName: bt.taskName,
    equipmentId: bt.equipmentId ?? `EQ-${bt.id}`,
    equipmentName: bt.equipmentName ?? (bt.equipments?.[0] ?? 'Unknown Equipment'),
    area: bt.areaName,
    zone: bt.zoneName,
    type: (bt.type as TaskType) ?? 'MAINTENANCE',
    status: (bt.status as TaskStatus) ?? 'Pending',
    priority: (bt.priority as TaskPriority) ?? 'Low',
    date: new Date().toISOString().split('T')[0],
    description: bt.description ?? '',
    operatorName: bt.operatorName,
    equipmentsList: bt.equipments ?? [],
  };
}

// ─── Provider ──────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [backendStatus, setBackendStatus] = useState<'ONLINE' | 'SERVER_DOWN' | 'OFFLINE'>('ONLINE');
  const [syncingCount, setSyncingCount] = useState(0);

  // Fetch tasks for the logged-in operator
  const fetchTasks = useCallback(async (authToken?: string) => {
    const tkn = authToken ?? token;
    if (!tkn) return;

    setIsLoadingTasks(true);
    try {
      const backendTasks = await getMyTasks(tkn);
      setTasks(backendTasks.map(mapBackendTask));
      setBackendStatus('ONLINE');
      setIsOnline(true);
    } catch (err) {
      console.warn('Failed to fetch tasks from backend', err);
      // Determine if offline or server down
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        setBackendStatus('OFFLINE');
        setIsOnline(false);
      } else {
        setBackendStatus('SERVER_DOWN');
        setIsOnline(true);
      }
    } finally {
      setIsLoadingTasks(false);
    }
  }, [token]);

  // Sync offline updates to the backend
  const syncOfflineQueue = useCallback(async (authToken?: string) => {
    const tkn = authToken ?? token;
    if (!tkn) return;

    try {
      const queuedStr = await AsyncStorage.getItem('@offline_queue');
      if (!queuedStr) {
        setSyncingCount(0);
        return;
      }

      const queue: Array<{ id: string; endpoint: string; method: 'PATCH' | 'POST'; data: any; timestamp: number }> = JSON.parse(queuedStr);
      if (queue.length === 0) {
        setSyncingCount(0);
        return;
      }

      console.log(`Syncing ${queue.length} offline requests to backend...`);
      setSyncingCount(queue.length);

      const failedQueue: typeof queue = [];

      for (const req of queue) {
        try {
          const res = await fetch(`${BASE_URL}${req.endpoint}`, {
            method: req.method,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tkn}`,
            },
            body: JSON.stringify(req.data),
          });
          
          if (!res.ok) {
            throw new Error(`Server returned status ${res.status}`);
          }
          console.log(`Successfully synced offline request: ${req.endpoint}`);
        } catch (err) {
          console.warn(`Failed to sync offline request for ${req.endpoint}:`, err);
          failedQueue.push(req);
        }
      }

      if (failedQueue.length > 0) {
        await AsyncStorage.setItem('@offline_queue', JSON.stringify(failedQueue));
        setSyncingCount(failedQueue.length);
      } else {
        await AsyncStorage.removeItem('@offline_queue');
        setSyncingCount(0);
        console.log('Offline queue sync completed successfully.');
      }

      // Re-fetch tasks after sync
      await fetchTasks(tkn);
    } catch (err) {
      console.warn('Error in syncOfflineQueue:', err);
    }
  }, [token, fetchTasks]);

  const addOfflineRequest = async (endpoint: string, method: 'PATCH' | 'POST', data: any) => {
    try {
      const queuedStr = await AsyncStorage.getItem('@offline_queue');
      const queue: Array<{ id: string; endpoint: string; method: 'PATCH' | 'POST'; data: any; timestamp: number }> = queuedStr ? JSON.parse(queuedStr) : [];
      
      const id = Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
      
      // Deduplicate task status update requests in the queue
      let filteredQueue = queue;
      if (method === 'PATCH' && endpoint.startsWith('/task/')) {
        filteredQueue = queue.filter(item => !(item.method === 'PATCH' && item.endpoint === endpoint));
      }
      
      filteredQueue.push({
        id,
        endpoint,
        method,
        data,
        timestamp: Date.now(),
      });
      
      await AsyncStorage.setItem('@offline_queue', JSON.stringify(filteredQueue));
      setSyncingCount(filteredQueue.length);
      console.log(`Queued offline request to ${endpoint}:`, data);
    } catch (err) {
      console.warn('Failed to queue offline request:', err);
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    // 1. Update status locally immediately (optimistic UI)
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, status } : t))
    );

    const tkn = token;
    if (!tkn) return;

    if (backendStatus === 'ONLINE') {
      try {
        await updateTaskStatusApi(taskId, status, tkn);
        console.log(`Successfully updated task ${taskId} online`);
      } catch (err) {
        console.warn(`Online update failed for task ${taskId}, queueing instead`, err);
        await addOfflineRequest(`/task/${taskId}`, 'PATCH', { status });
        setBackendStatus('SERVER_DOWN');
      }
    } else {
      await addOfflineRequest(`/task/${taskId}`, 'PATCH', { status });
    }
  };

  const addRemark = async (taskId: string, remarkText: string) => {
    const tkn = token;
    if (!tkn) return;

    if (backendStatus === 'ONLINE') {
      try {
        await addRemarkApi(parseInt(taskId, 10), remarkText, tkn);
        console.log(`Successfully added remark for task ${taskId} online`);
      } catch (err) {
        console.warn(`Online remark addition failed for task ${taskId}, queueing instead`, err);
        await addOfflineRequest(`/task/${taskId}/remarks`, 'POST', { remarkText });
        setBackendStatus('SERVER_DOWN');
      }
    } else {
      await addOfflineRequest(`/task/${taskId}/remarks`, 'POST', { remarkText });
    }
  };

  const checkConnection = useCallback(async () => {
    const netState = await NetInfo.fetch();
    const hasInternet = !!netState.isConnected;
    if (!hasInternet) {
      setBackendStatus('OFFLINE');
      setIsOnline(false);
      return;
    }

    const isBackendUp = await checkHealthApi();
    if (isBackendUp) {
      const wasOfflineOrServerDown = backendStatus !== 'ONLINE';
      setBackendStatus('ONLINE');
      setIsOnline(true);
      if (wasOfflineOrServerDown && token) {
        syncOfflineQueue(token);
      }
    } else {
      setBackendStatus('SERVER_DOWN');
      setIsOnline(true);
    }
  }, [token, syncOfflineQueue, backendStatus]);

  // Connection check interval (10 seconds)
  useEffect(() => {
    checkConnection();

    const interval = setInterval(() => {
      checkConnection();
    }, 10000);

    return () => clearInterval(interval);
  }, [checkConnection]);

  // Listen for network state changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const hasInternet = !!state.isConnected;
      if (!hasInternet) {
        setBackendStatus('OFFLINE');
        setIsOnline(false);
      } else {
        checkHealthApi().then((isBackendUp) => {
          if (isBackendUp) {
            setBackendStatus('ONLINE');
            setIsOnline(true);
            if (token) {
              syncOfflineQueue(token);
            }
          } else {
            setBackendStatus('SERVER_DOWN');
            setIsOnline(true);
          }
        });
      }
    });

    // Also check queue size on startup
    AsyncStorage.getItem('@offline_queue').then((queuedStr) => {
      if (queuedStr) {
        const queue = JSON.parse(queuedStr);
        setSyncingCount(queue.length);
      }
    }).catch(() => {});

    return () => unsubscribe();
  }, [token, syncOfflineQueue]);

  // Login — only operators can login through the app
  const login = async (username: string, password: string) => {
    if (!username.trim() || !password.trim()) {
      return { success: false, error: 'All fields are required' };
    }

    try {
      const response = await loginApi(username.trim(), password);

      const roles = response.roles ?? [];
      const isOperator = roles.some(
        (r) => r.toLowerCase() === 'operator',
      );

      if (!isOperator) {
        return {
          success: false,
          error: 'Access denied. Only operators can log in to this app.',
        };
      }

      setToken(response.token);

      const loggedUser: User = {
        username: response.username,
        firstName: response.firstName,
        lastName: response.lastName,
        roles: response.roles,
      };

      setUser(loggedUser);

      await fetchTasks(response.token);
      await syncOfflineQueue(response.token);

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Login failed. Please check your credentials.',
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setTasks([]);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        tasks,
        isLoadingTasks,
        isOnline,
        backendStatus,
        syncingCount,
        login,
        logout,
        fetchTasks,
        updateTaskStatus,
        addRemark,
        syncOfflineQueue: () => syncOfflineQueue(),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
