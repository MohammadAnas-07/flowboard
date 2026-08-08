'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ChevronRightIcon } from '@/components/layout/icons';
import { FieldsDropdown } from '@/components/shared/fields-dropdown';
import { ListView, TASK_FIELD_OPTIONS, TASK_FILTER_FIELDS } from '@/components/tasks/list-view';
import { ApiError, deleteTask, getProject, getProjectTasksGrouped } from '@/lib/api';
import type { Priority, Project, Status, Task } from '@/lib/types';

const DEFAULT_VISIBLE_FIELDS = new Set(['members', 'dueDate']);

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleFields, setVisibleFields] = useState<Set<string>>(DEFAULT_VISIBLE_FIELDS);
  const [statusFilter, setStatusFilter] = useState<Status | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<Priority | null>(null);

  useEffect(() => {
    Promise.all([getProject(params.id), getProjectTasksGrouped(params.id)])
      .then(([proj, grouped]) => {
        setProject(proj);
        // Reuses the same ListView (and DataTable) the Tasks page uses —
        // it re-groups a flat task list by status itself, so flattening the
        // grouped response back into an array is all that's needed here.
        setTasks(Object.values(grouped).flat());
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load project'))
      .finally(() => setLoading(false));
  }, [params.id]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter && t.status !== statusFilter) return false;
      if (priorityFilter && t.priority !== priorityFilter) return false;
      return true;
    });
  }, [tasks, statusFilter, priorityFilter]);

  function handleFilterChange(fieldKey: string, valueKey: string | null) {
    if (fieldKey === 'status') setStatusFilter(valueKey as Status | null);
    if (fieldKey === 'priority') setPriorityFilter(valueKey as Priority | null);
  }

  async function handleDeleteTask(id: string) {
    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTask(id);
    } catch (err) {
      setTasks(previous);
      setError(err instanceof ApiError ? err.message : 'Could not delete task — reverted.');
    }
  }

  function toggleField(key: string) {
    setVisibleFields((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b border-black/[.08] px-6 py-4 dark:border-white/[.145]">
        <nav className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/projects" className="hover:text-black dark:hover:text-zinc-50">
            Projects
          </Link>
          <ChevronRightIcon className="h-3.5 w-3.5" />
          <span className="font-medium text-black dark:text-zinc-50">
            {project?.name ?? '…'}
          </span>
        </nav>

        <div className="ml-auto">
          <FieldsDropdown
            fields={TASK_FIELD_OPTIONS}
            visible={visibleFields}
            onToggle={toggleField}
            filterFields={TASK_FILTER_FIELDS}
            activeFilters={{ status: statusFilter, priority: priorityFilter }}
            onFilterChange={handleFilterChange}
          />
        </div>
      </header>

      {error && (
        <div className="flex items-center justify-between bg-red-50 px-6 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          {error}
          <button type="button" onClick={() => setError(null)} className="font-medium underline">
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">Loading…</div>
      ) : (
        <ListView
          tasks={filteredTasks}
          visibleFields={visibleFields}
          onDeleteTask={handleDeleteTask}
          onOpenTask={(id) => router.push(`/tasks/${id}`)}
        />
      )}
    </div>
  );
}
