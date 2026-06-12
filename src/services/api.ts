// Central API service for communicating with the BackendCMMS server.
// All backend calls go through this module.

import { Platform } from 'react-native';

export const BASE_URL = Platform.select({
  android: 'http://192.168.18.185:5128',
  ios: 'http://localhost:5128',
  default: 'http://localhost:5128',
});

// ─── Auth ──────────────────────────────────────────────

export interface LoginResponse {
  token: string;
  expiresAt: string;
  username: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export async function loginApi(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? 'Login failed');
  }

  return res.json();
}

// ─── Tasks ─────────────────────────────────────────────

export interface BackendTask {
  id: number;
  taskName: string;
  createdBy: string | null;
  areaName: string;
  zoneName: string;
  operatorName: string;
  equipments: string[];
  equipmentId?: string;
  equipmentName?: string;
  type?: string;
  status?: string;
  priority?: string;
  description?: string;
}

interface TasksResponse {
  task: BackendTask[];
}

export async function getMyTasks(token: string): Promise<BackendTask[]> {
  const res = await fetch(`${BASE_URL}/task/my-tasks`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? 'Failed to fetch tasks');
  }

  const data: TasksResponse = await res.json();
  return data.task ?? [];
}

export async function updateTaskStatusApi(
  taskId: string,
  status: string,
  token: string,
): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${BASE_URL}/task/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? 'Failed to update task status');
  }

  return res.json();
}

// ─── User Profile ──────────────────────────────────────

export interface BackendUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  status: string;
  username: string;
  roles: string[] | null;
  permissionAllocated: string[] | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export async function getUserProfile(
  token: string,
  username: string,
): Promise<BackendUser | null> {
  // The backend GET /user returns all users (needs CanViewUser permission).
  // Operators may not have that permission, so we'll handle 403 gracefully.
  try {
    const res = await fetch(`${BASE_URL}/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return null; // Operator may not have permission to view user list
    }

    const users: BackendUser[] = await res.json();
    return users.find((u) => u.username === username) ?? null;
  } catch {
    return null;
  }
}

export async function forgotPasswordApi(
  username: string,
  email: string,
  newPassword: string,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, newPassword }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message ?? 'Reset password failed.');
  }
  return {
    success: true,
    message: data?.message ?? 'Password updated successfully.',
  };
}

export interface TaskRemark {
  id: number;
  taskId: number;
  remarkText: string;
  createdBy: string;
  createdAt: string;
}

export async function checkHealthApi(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getRemarksApi(
  taskId: number,
  token: string,
): Promise<TaskRemark[]> {
  const res = await fetch(`${BASE_URL}/task/${taskId}/remarks`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? 'Failed to fetch remarks');
  }

  return res.json();
}

export async function addRemarkApi(
  taskId: number,
  remarkText: string,
  token: string,
): Promise<TaskRemark> {
  const res = await fetch(`${BASE_URL}/task/${taskId}/remarks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ remarkText }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? 'Failed to add remark');
  }

  return res.json();
}

