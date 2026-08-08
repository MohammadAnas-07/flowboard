// All calls are relative (/api/*) so they go through the same-origin rewrite
// proxy (see next.config.ts) — never call the Render URL directly from the
// client. This is required for the session cookie to be visible cross-origin
// (see the fix/cross-origin-session-cookie history for why).
import type {
  Comment,
  Label,
  Priority,
  Project,
  Status,
  Subtask,
  Task,
  TaskActivity,
  TasksGroupedByStatus,
} from './types';

// Shapes accepted by the create/update endpoints — distinct from the Task/
// Subtask *response* shapes (which nest full `labels`/`assignees` objects,
// not the id arrays the backend's DTOs expect for writes).
export interface TaskInput {
  title?: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  // null clears the date (vs. undefined, which leaves it untouched) — the
  // backend's IsOptional validators accept null the same as a missing key.
  startDate?: string | null;
  dueDate?: string | null;
  resourceUrl?: string;
  projectId?: string;
  assigneeIds?: string[];
  labelIds?: string[];
}

export interface SubtaskInput {
  title?: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  startDate?: string;
  dueDate?: string;
  assigneeIds?: string[];
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
    ...init,
  });
  if (!res.ok) {
    const body = await res.text();
    let message = body;
    try {
      message = JSON.parse(body).message ?? body;
    } catch {
      // not JSON, use raw text
    }
    throw new ApiError(res.status, Array.isArray(message) ? message.join(', ') : message);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---- Tasks ----
export interface TaskFilters {
  projectId?: string;
  assigneeId?: string;
  status?: Status;
  priority?: string;
}

export function getTasks(filters: TaskFilters = {}): Promise<Task[]> {
  const params = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v !== undefined) as [string, string][],
  );
  const qs = params.toString();
  return request(`/api/tasks${qs ? `?${qs}` : ''}`);
}

export function getTask(id: string): Promise<Task> {
  return request(`/api/tasks/${id}`);
}

export function createTask(data: TaskInput & { title: string }): Promise<Task> {
  return request('/api/tasks', { method: 'POST', body: JSON.stringify(data) });
}

export function updateTask(id: string, data: TaskInput): Promise<Task> {
  return request(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function updateTaskStatus(id: string, status: Status): Promise<Task> {
  return request(`/api/tasks/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function deleteTask(id: string): Promise<void> {
  return request(`/api/tasks/${id}`, { method: 'DELETE' });
}

export function getTaskActivity(id: string): Promise<TaskActivity[]> {
  return request(`/api/tasks/${id}/activity`);
}

// ---- Projects ----
export function getProjects(): Promise<Project[]> {
  return request('/api/projects');
}

export function getProject(id: string): Promise<Project> {
  return request(`/api/projects/${id}`);
}

export function createProject(data: Partial<Project> & { name: string }): Promise<Project> {
  return request('/api/projects', { method: 'POST', body: JSON.stringify(data) });
}

export function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  return request(`/api/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function deleteProject(id: string): Promise<void> {
  return request(`/api/projects/${id}`, { method: 'DELETE' });
}

export function getProjectTasksGrouped(id: string): Promise<TasksGroupedByStatus> {
  return request(`/api/projects/${id}/tasks`);
}

export function createProjectTask(
  projectId: string,
  data: TaskInput & { title: string },
): Promise<Task> {
  return request(`/api/projects/${projectId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ---- Subtasks ----
export function getSubtasks(taskId: string): Promise<Subtask[]> {
  return request(`/api/tasks/${taskId}/subtasks`);
}

export function createSubtask(
  taskId: string,
  data: SubtaskInput & { title: string },
): Promise<Subtask> {
  return request(`/api/tasks/${taskId}/subtasks`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function deleteSubtask(taskId: string, id: string): Promise<void> {
  return request(`/api/tasks/${taskId}/subtasks/${id}`, { method: 'DELETE' });
}

// ---- Comments ----
export function getComments(taskId: string): Promise<Comment[]> {
  return request(`/api/tasks/${taskId}/comments`);
}

export function createComment(taskId: string, body: string): Promise<Comment> {
  return request(`/api/tasks/${taskId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
}

// ---- Labels ----
export function getLabels(): Promise<Label[]> {
  return request('/api/labels');
}
