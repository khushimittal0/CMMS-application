import React, { createContext, useContext, useState, ReactNode } from 'react';

export type TaskType = 'MAINTENANCE' | 'REPAIR' | 'INSPECTION';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  equipmentId: string;
  equipmentName: string;
  area: string;
  zone: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  date: string;
  description: string;
}

export interface User {
  username: string;
  fullName: string;
  role: string;
}

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  tasks: Task[];
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  addTask: (task: Omit<Task, 'id' | 'date'>) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialTasks: Task[] = [
  {
    id: 'T-1001',
    equipmentId: 'BF-101',
    equipmentName: 'Blast Furnace BF-1 Charging System',
    area: 'Blast Furnace Bay',
    zone: 'Zone A',
    type: 'INSPECTION',
    status: 'Pending',
    priority: 'High',
    date: '2026-06-04',
    description: 'Inspect hopper gates and seal valves for gas leakage and wear due to high temperature raw materials.',
  },
  {
    id: 'T-1002',
    equipmentId: 'CCM-204',
    equipmentName: 'Continuous Caster C-2 Tundish Nozzle',
    area: 'Casting Shop',
    zone: 'Zone B',
    type: 'REPAIR',
    status: 'In Progress',
    priority: 'High',
    date: '2026-06-03',
    description: 'Replace nozzle refractory blocks and align ladle shroud mechanisms.',
  },
  {
    id: 'T-1003',
    equipmentId: 'HRM-308',
    equipmentName: 'Hot Rolling Mill Roll Lubricator',
    area: 'Rolling Mill Area',
    zone: 'Zone C',
    type: 'MAINTENANCE',
    status: 'Completed',
    priority: 'Medium',
    date: '2026-06-02',
    description: 'Lubricate work roll bearings and check oil-mist hydraulic pressure levels.',
  },
  {
    id: 'T-1004',
    equipmentId: 'COB-412',
    equipmentName: 'Coke Oven Gas Distribution Valve',
    area: 'Coke Oven Division',
    zone: 'Zone A',
    type: 'MAINTENANCE',
    status: 'Pending',
    priority: 'Low',
    date: '2026-06-04',
    description: 'Check gas manifold valves and inspect coke pusher alignment guides.',
  },
  {
    id: 'T-1005',
    equipmentId: 'BOF-505',
    equipmentName: 'Oxygen Converter A Cooling Line',
    area: 'Converter Shop',
    zone: 'Zone D',
    type: 'REPAIR',
    status: 'Pending',
    priority: 'High',
    date: '2026-06-04',
    description: 'Repair cooling water line joint leakage to prevent oxygen lance overheating.',
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const login = async (username: string, password: string) => {
    // Simple basic mock validations
    if (!username.trim() || !password.trim()) {
      return { success: false, error: 'All fields are required' };
    }
    
    const cleanUsername = username.trim().toLowerCase();
    
    if (cleanUsername === 'operator' && password === 'operator123') {
      const loggedUser = {
        username: 'operator',
        fullName: 'mera operator',
        role: 'Operator',
      };
      setUser(loggedUser);
      return { success: true };
    } else {
      return { success: false, error: 'Invalid username or password' };
    }
  };

  const logout = () => {
    setUser(null);
  };

  const addTask = (newTask: Omit<Task, 'id' | 'date'>) => {
    const formattedTask: Task = {
      ...newTask,
      id: `T-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
    };
    setTasks((prevTasks) => [formattedTask, ...prevTasks]);
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === id ? { ...task, status } : task))
    );
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        tasks,
        login,
        logout,
        addTask,
        updateTaskStatus,
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
