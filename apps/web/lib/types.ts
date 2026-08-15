export type Priority = 'none' | 'urgent' | 'high' | 'medium' | 'low';
export type Status = 'To Do' | 'Doing' | 'Completed' | 'On Hold';

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  title: string;
  avatarUrl: string;
  isGuest?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  dueDate: string | null;
  labels: string;
  reporter: string;
  assignee?: User | null;
  subtasks?: Task[];
  comments?: Comment[];
  projectId?: string | null;
  _count?: { comments: number; subtasks: number };
}

export interface Comment {
  id: string;
  body: string;
  createdAt: string;
  author?: User | null;
}

export interface Project {
  id: string;
  name: string;
  priority: Priority;
  dueDate: string | null;
  lead?: User | null;
  _count?: { tasks: number };
}

export const STATUSES: Status[] = ['To Do', 'Doing', 'Completed', 'On Hold'];
export const PRIORITIES: Priority[] = ['none', 'urgent', 'high', 'medium', 'low'];
