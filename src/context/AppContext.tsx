import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { loginApi, getMyTasks, BackendTask } from '../services/api';

// ─── Types ─────────────────────────────────────────────

export interface Task {
  id: string;
  taskName: string;
  areaName: string;
  zoneName: string;
  operatorName: string;
  equipments: string[];
  createdBy: string | null;
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
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  fetchTasks: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── Helpers ───────────────────────────────────────────

function mapBackendTask(bt: BackendTask): Task {
  return {
    id: bt.id.toString(),
    taskName: bt.taskName,
    areaName: bt.areaName,
    zoneName: bt.zoneName,
    operatorName: bt.operatorName,
    equipments: bt.equipments ?? [],
    createdBy: bt.createdBy,
  };
}

// ─── Provider ──────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  // Fetch tasks for the logged-in operator
  const fetchTasks = useCallback(async (authToken?: string) => {
    const tkn = authToken ?? token;
    if (!tkn) return;

    setIsLoadingTasks(true);
    try {
      const backendTasks = await getMyTasks(tkn);
      setTasks(backendTasks.map(mapBackendTask));
    } catch {
      // If fetch fails, keep existing tasks (could be network issue)
      console.warn('Failed to fetch tasks from backend');
    } finally {
      setIsLoadingTasks(false);
    }
  }, [token]);

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

      // Store token and user info
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
        login,
        logout,
        fetchTasks,
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
