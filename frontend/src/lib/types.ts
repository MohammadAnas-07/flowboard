// Mirrors backend/prisma/schema.prisma enums and Prisma include shapes used
// by the Task/Project/Subtask/Comment/Label modules. Keep in sync.

export type Status = 'BACKLOG' | 'TODO' | 'DOING' | 'COMPLETED' | 'ON_HOLD';

export type Priority = 'NO_PRIORITY' | 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

// Board columns exclude BACKLOG — see architecture.md Section 7 ("Backlog
// tasks exist pre-board and don't render until moved to a column").
export const BOARD_STATUSES: Status[] = ['TODO', 'DOING', 'COMPLETED', 'ON_HOLD'];

// List view shows every status, including Backlog.
export const ALL_STATUSES: Status[] = ['BACKLOG', 'TODO', 'DOING', 'COMPLETED', 'ON_HOLD'];

export const STATUS_LABELS: Record<Status, string> = {
  BACKLOG: 'Backlog',
  TODO: 'To Do',
  DOING: 'Doing',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  NO_PRIORITY: 'No Priority',
  URGENT: 'Urgent',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  isGuest: boolean;
  theme: string | null;
  accentColor: string | null;
}

export interface Label {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  priority: Priority;
  leadId: string | null;
  lead: User | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { tasks: number };
}

export interface Subtask {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  startDate: string | null;
  dueDate: string | null;
  parentTaskId: string;
  assignees: User[];
}

export interface Comment {
  id: string;
  body: string;
  createdAt: string;
  taskId: string;
  authorId: string;
  author: User;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  startDate: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  projectId: string | null;
  project?: Project | null;
  assignees: User[];
  labels: Label[];
  subtasks?: Subtask[];
  comments?: Comment[];
}

export type TasksGroupedByStatus = Record<Status, Task[]>;
