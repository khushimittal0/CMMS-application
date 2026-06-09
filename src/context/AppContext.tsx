import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginApi, getMyTasks, updateTaskStatusApi, BackendTask } from '../services/api';

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
  syncingCount: number;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  fetchTasks: () => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
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
    // Format creation time or use today's date if not present
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
  const [syncingCount, setSyncingCount] = useState(0);

  // Fetch tasks for the logged-in operator
  const fetchTasks = useCallback(async (authToken?: string) => {
    const tkn = authToken ?? token;
    if (!tkn) return;

    setIsLoadingTasks(true);
    try {
      const backendTasks = await getMyTasks(tkn);
      setTasks(backendTasks.map(mapBackendTask));
      setIsOnline(true); // Successful fetch proves we are online
    } catch (err) {
      console.warn('Failed to fetch tasks from backend', err);
      // Keep existing tasks, but assume we are offline if fetch failed with network exception
      setIsOnline(false);
    } finally {
      setIsLoadingTasks(false);
    }
  }, [token]);

  // Sync offline updates to the backend
  const syncOfflineQueue = useCallback(async (authToken?: string) => {
    const tkn = authToken ?? token;
    if (!tkn) return;

    try {
      const queuedStr = await AsyncStorage.getItem('@offline_updates');
      if (!queuedStr) {
        setSyncingCount(0);
        return;
      }

      const queue: Array<{ id: string; status: TaskStatus }> = JSON.parse(queuedStr);
      if (queue.length === 0) {
        setSyncingCount(0);
        return;
      }

      console.log(`Syncing ${queue.length} offline updates to backend...`);
      setSyncingCount(queue.length);

      const failedQueue: Array<{ id: string; status: TaskStatus }> = [];

      for (const update of queue) {
        try {
          await updateTaskStatusApi(update.id, update.status, tkn);
          console.log(`Synced task ${update.id} to status: ${update.status}`);
        } catch (err) {
          console.warn(`Failed to sync task ${update.id}:`, err);
          failedQueue.push(update);
        }
      }

      if (failedQueue.length > 0) {
        await AsyncStorage.setItem('@offline_updates', JSON.stringify(failedQueue));
        setSyncingCount(failedQueue.length);
        setIsOnline(false);
      } else {
        await AsyncStorage.removeItem('@offline_updates');
        setSyncingCount(0);
        setIsOnline(true);
        console.log('Offline queue sync completed successfully.');
      }

      // Re-fetch tasks after sync
      await fetchTasks(tkn);
    } catch (err) {
      console.warn('Error in syncOfflineQueue:', err);
    }
  }, [token, fetchTasks]);

  // Update status helper for local & AsyncStorage queueing
  const queueOfflineUpdate = async (taskId: string, status: TaskStatus) => {
    try {
      const queuedStr = await AsyncStorage.getItem('@offline_updates');
      const queue: Array<{ id: string; status: TaskStatus }> = queuedStr ? JSON.parse(queuedStr) : [];
      
      // Remove any existing updates for this task in the queue, keep the latest status change
      const filteredQueue = queue.filter(item => item.id !== taskId);
      filteredQueue.push({ id: taskId, status });
      
      await AsyncStorage.setItem('@offline_updates', JSON.stringify(filteredQueue));
      setSyncingCount(filteredQueue.length);
      console.log(`Queued task ${taskId} status update offline: ${status}`);
    } catch (err) {
      console.warn('Failed to queue offline update:', err);
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    // 1. Update status locally immediately (optimistic UI)
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, status } : t))
    );

    const tkn = token;
    if (!tkn) return;

    if (isOnline) {
      try {
        await updateTaskStatusApi(taskId, status, tkn);
        console.log(`Successfully updated task ${taskId} online`);
      } catch (err) {
        console.warn(`Online update failed for task ${taskId}, queueing instead`, err);
        await queueOfflineUpdate(taskId, status);
        setIsOnline(false);
      }
    } else {
      await queueOfflineUpdate(taskId, status);
    }
  };

  // Listen for network state changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = !!state.isConnected;
      setIsOnline(online);
      if (online && token) {
        syncOfflineQueue(token);
      }
    });

    // Also check queue size on startup
    AsyncStorage.getItem('@offline_updates').then((queuedStr) => {
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

      // Check if user has operator role
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

      // Fetch operator's tasks right after login
      await fetchTasks(response.token);
      // Attempt to sync offline queue if online
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
        syncingCount,
        login,
        logout,
        fetchTasks,
        updateTaskStatus,
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
