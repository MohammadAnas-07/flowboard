'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { SearchIcon } from '@/components/layout/icons';
import { FieldsDropdown } from '@/components/shared/fields-dropdown';
import { BoardView } from '@/components/tasks/board-view';
import { ListView, TASK_FIELD_OPTIONS, TASK_FILTER_FIELDS } from '@/components/tasks/list-view';
import { ApiError, createTask, deleteTask, getTasks, updateTaskStatus } from '@/lib/api';
import type { Priority, Status, Task } from '@/lib/types';

type ViewMode = 'list' | 'board';

const DEFAULT_VISIBLE_FIELDS = new Set(['members', 'dueDate']);

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>('board');
  const [search, setSearch] = useState('');
  const [visibleFields, setVisibleFields] = useState<Set<string>>(DEFAULT_VISIBLE_FIELDS);
  // Fields-dropdown value filters (Status/Priority submenus) — client-side
  // only, applies to both board and list view since both read
  // `filteredTasks`. Not persisted: resets on navigation/refresh by design
  // (plain useState, same as `search` and `visibleFields` above).
  const [statusFilter, setStatusFilter] = useState<Status | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<Priority | null>(null);

  useEffect(() => {
    getTasks()
      .then(setTasks)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load tasks'))
      .finally(() => setLoading(false));
  }, []);

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q)) return false;
      if (statusFilter && t.status !== statusFilter) return false;
      if (priorityFilter && t.priority !== priorityFilter) return false;
      return true;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  function handleFilterChange(fieldKey: string, valueKey: string | null) {
    if (fieldKey === 'status') setStatusFilter(valueKey as Status | null);
    if (fieldKey === 'priority') setPriorityFilter(valueKey as Priority | null);
  }

  async function handleMoveTask(id: string, status: Status) {
    const previous = tasks;
    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    try {
      await updateTaskStatus(id, status);
    } catch (err) {
      // Roll back on failure
      setTasks(previous);
      setError(err instanceof ApiError ? err.message : 'Could not move task — reverted.');
    }
  }

  async function handleCreateTask(status: Status, title: string) {
    try {
      const task = await createTask({ title, status });
      setTasks((prev) => [task, ...prev]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create task');
    }
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
        <h1 className="text-lg font-semibold text-black dark:text-zinc-50">Tasks</h1>

        <div className="relative ml-auto flex items-center">
          <SearchIcon className="pointer-events-none absolute left-2.5 h-4 w-4 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            className="w-56 rounded-lg border border-black/[.08] bg-transparent py-1.5 pl-8 pr-3 text-sm text-black outline-none placeholder:text-zinc-400 focus:border-black/[.2] dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-white/[.3]"
          />
        </div>

        <FieldsDropdown
          // Column-visibility checkboxes only make sense in list view
          // (board cards have fixed content); the Status/Priority filter
          // submenus apply to both, since both views read filteredTasks.
          fields={view === 'list' ? TASK_FIELD_OPTIONS : []}
          visible={visibleFields}
          onToggle={toggleField}
          filterFields={TASK_FILTER_FIELDS}
          activeFilters={{ status: statusFilter, priority: priorityFilter }}
          onFilterChange={handleFilterChange}
        />

        <div className="flex rounded-full border border-black/[.08] p-0.5 dark:border-white/[.145]">
          {(['list', 'board'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              className={`rounded-full px-3 py-1 text-sm font-medium capitalize transition-colors ${
                view === mode
                  ? 'bg-accent text-accent-foreground'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              {mode}
            </button>
          ))}
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
      ) : view === 'board' ? (
        <BoardView
          tasks={filteredTasks}
          onMoveTask={handleMoveTask}
          onCreateTask={handleCreateTask}
          onOpenTask={(id) => router.push(`/tasks/${id}`)}
        />
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
