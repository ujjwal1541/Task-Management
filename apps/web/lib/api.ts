import type { Comment, Project, Task, User } from './types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
const TOKEN_KEY = 'ablespace.token';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed with ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  guestLogin: () => request<{ token: string; user: User }>('/auth/guest', { method: 'POST' }),
  me: () => request<User>('/auth/me'),
  users: () => request<User[]>('/users'),
  updateProfile: (body: Partial<User>) => request<User>('/users/me', { method: 'PATCH', body: JSON.stringify(body) }),

  tasks: (params: Record<string, string | undefined> = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v) as [string, string][],
    ).toString();
    return request<Task[]>(`/tasks${qs ? `?${qs}` : ''}`);
  },
  task: (id: string) => request<Task>(`/tasks/${id}`),
  createTask: (body: Partial<Task> & { title: string; labels?: string[] }) =>
    request<Task>('/tasks', { method: 'POST', body: JSON.stringify(body) }),
  updateTask: (id: string, body: Record<string, unknown>) =>
    request<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteTask: (id: string) => request<{ id: string }>(`/tasks/${id}`, { method: 'DELETE' }),
  addComment: (id: string, body: string) =>
    request<Comment>(`/tasks/${id}/comments`, { method: 'POST', body: JSON.stringify({ body }) }),

  projects: (q?: string) => request<Project[]>(`/projects${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  createProject: (body: Record<string, unknown>) =>
    request<Project>('/projects', { method: 'POST', body: JSON.stringify(body) }),
  updateProject: (id: string, body: Record<string, unknown>) =>
    request<Project>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteProject: (id: string) => request<{ id: string }>(`/projects/${id}`, { method: 'DELETE' }),
};
