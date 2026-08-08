'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ChevronLeftIcon } from '@/components/layout/icons';
import { Avatar } from '@/components/ui/avatar';
import { CommentsThread } from '@/components/tasks/comments-thread';
import { DetailsSidebar } from '@/components/tasks/details-sidebar';
import { EditableTitleDescription } from '@/components/tasks/editable-title-description';
import { LabelPicker } from '@/components/tasks/label-picker';
import { ResourcesInput } from '@/components/tasks/resources-input';
import { SubtasksTable } from '@/components/tasks/subtasks-table';
import { DueDateBadge } from '@/components/tasks/status-priority-badges';
import {
  ApiError,
  createComment,
  createSubtask,
  deleteSubtask,
  getComments,
  getSubtasks,
  getTask,
  getTaskActivity,
  type TaskInput,
  updateTask,
  updateTaskStatus,
} from '@/lib/api';
import type { Comment, Priority, Status, Subtask, Task, TaskActivity } from '@/lib/types';

export default function TaskDetailPage() {
  const params = useParams<{ taskId: string }>();
  const taskId = params.taskId;

  const [task, setTask] = useState<Task | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activity, setActivity] = useState<TaskActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [t, s, c, a] = await Promise.all([
        getTask(taskId),
        getSubtasks(taskId),
        getComments(taskId),
        getTaskActivity(taskId),
      ]);
      setTask(t);
      setSubtasks(s);
      setComments(c);
      setActivity(a);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load task');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    load();
  }, [load]);

  async function applyTaskUpdate(patch: TaskInput) {
    if (!task) return;
    const previous = task;
    setTask({ ...task, ...patch });
    try {
      const updated = await updateTask(taskId, patch);
      setTask(updated);
      // Tracked-field changes (status/priority/dates/assignee) get logged
      // server-side — refresh the Updates panel to reflect it.
      getTaskActivity(taskId).then(setActivity).catch(() => {});
    } catch (err) {
      setTask(previous);
      setError(err instanceof ApiError ? err.message : 'Update failed — reverted.');
    }
  }

  async function handleStatusChange(status: Status) {
    if (!task) return;
    const previous = task;
    setTask({ ...task, status });
    try {
      const updated = await updateTaskStatus(taskId, status);
      setTask(updated);
      getTaskActivity(taskId).then(setActivity).catch(() => {});
    } catch (err) {
      setTask(previous);
      setError(err instanceof ApiError ? err.message : 'Status update failed — reverted.');
    }
  }

  async function handleAddSubtask(title: string) {
    try {
      const subtask = await createSubtask(taskId, { title });
      setSubtasks((prev) => [...prev, subtask]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add subtask');
    }
  }

  async function handleDeleteSubtask(id: string) {
    const previous = subtasks;
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteSubtask(taskId, id);
    } catch (err) {
      setSubtasks(previous);
      setError(err instanceof ApiError ? err.message : 'Could not delete subtask — reverted.');
    }
  }

  async function handleAddComment(body: string) {
    try {
      const comment = await createComment(taskId, body);
      setComments((prev) => [...prev, comment]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add comment');
    }
  }

  if (loading) {
    return <div className="flex h-full items-center justify-center text-sm text-zinc-500">Loading…</div>;
  }

  if (!task) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        {error ?? 'Task not found.'}
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-2 border-b border-black/[.08] px-6 py-3 dark:border-white/[.145]">
          <Link
            href="/tasks"
            className="flex items-center gap-1 text-sm text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Tasks
          </Link>
        </header>

        {error && (
          <div className="flex items-center justify-between bg-red-50 px-6 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
            {error}
            <button type="button" onClick={() => setError(null)} className="font-medium underline">
              Dismiss
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            <EditableTitleDescription
              title={task.title}
              description={task.description}
              onSaveTitle={(title) => applyTaskUpdate({ title })}
              onSaveDescription={(description) => applyTaskUpdate({ description })}
            />

            <div className="flex flex-wrap items-center gap-4">
              {task.assignees.length > 0 && (
                <div className="flex -space-x-1.5">
                  {task.assignees.map((u) => (
                    <Avatar key={u.id} user={u} size="sm" />
                  ))}
                </div>
              )}
              <DueDateBadge dueDate={task.dueDate} />
            </div>

            <LabelPicker
              selectedLabels={task.labels}
              onChange={(labelIds) => applyTaskUpdate({ labelIds })}
            />

            <section>
              <h3 className="mb-2 text-sm font-semibold text-black dark:text-zinc-50">Resources</h3>
              <ResourcesInput
                resourceUrl={task.resourceUrl}
                onChange={(resourceUrl) => applyTaskUpdate({ resourceUrl })}
              />
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold text-black dark:text-zinc-50">Subtasks</h3>
              <SubtasksTable
                subtasks={subtasks}
                onCreate={handleAddSubtask}
                onDelete={handleDeleteSubtask}
              />
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold text-black dark:text-zinc-50">Comments</h3>
              <CommentsThread comments={comments} onAdd={handleAddComment} />
            </section>
          </div>
        </div>
      </div>

      <DetailsSidebar
        task={task}
        activity={activity}
        onStatusChange={handleStatusChange}
        onPriorityChange={(priority: Priority) => applyTaskUpdate({ priority })}
        onDatesChange={(startDate, dueDate) => applyTaskUpdate({ startDate, dueDate })}
        onLabelsChange={(labelIds) => applyTaskUpdate({ labelIds })}
      />
    </div>
  );
}
