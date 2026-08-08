'use client';

import { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { DataTable, type Column } from '@/components/shared/data-table';
import { PlusIcon } from '@/components/layout/icons';
import type { Subtask } from '@/lib/types';
import { DueDateBadge, PriorityBadge } from './status-priority-badges';

interface SubtasksTableProps {
  subtasks: Subtask[];
  onCreate: (title: string) => void;
  onDelete: (id: string) => void;
}

/** Reuses the exact same DataTable component the Tasks list view and
 * Projects pages use — just a different column set, no fork. */
export function SubtasksTable({ subtasks, onCreate, onDelete }: SubtasksTableProps) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');

  const columns: Column<Subtask>[] = [
    {
      key: 'title',
      header: 'Task',
      render: (s) => <span className="font-medium text-black dark:text-zinc-50">{s.title}</span>,
    },
    { key: 'priority', header: 'Priority', render: (s) => <PriorityBadge priority={s.priority} /> },
    {
      key: 'members',
      header: 'Members',
      render: (s) =>
        s.assignees.length ? (
          <div className="flex -space-x-1.5">
            {s.assignees.map((u) => (
              <Avatar key={u.id} user={u} size="sm" />
            ))}
          </div>
        ) : (
          <span className="text-zinc-400">—</span>
        ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (s) => (s.dueDate ? <DueDateBadge dueDate={s.dueDate} /> : <span className="text-zinc-400">—</span>),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (s) => (
        <button
          type="button"
          onClick={() => onDelete(s.id)}
          className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          Delete
        </button>
      ),
    },
  ];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim()) {
      onCreate(title.trim());
      setTitle('');
      setAdding(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-black/[.08] dark:border-white/[.145]">
      <DataTable columns={columns} rows={subtasks} rowKey={(s) => s.id} emptyMessage="No subtasks yet." />
      <div className="border-t border-black/[.06] p-2 dark:border-white/[.08]">
        {adding ? (
          <form onSubmit={submit} className="flex gap-2">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setAdding(false)}
              placeholder="Subtask title…"
              className="flex-1 rounded border border-black/[.08] bg-transparent px-2 py-1 text-sm outline-none dark:border-white/[.145]"
            />
            <button type="submit" className="rounded bg-black px-2 py-1 text-xs font-medium text-white dark:bg-white dark:text-black">
              Add
            </button>
            <button type="button" onClick={() => setAdding(false)} className="rounded px-2 py-1 text-xs text-zinc-500">
              Cancel
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <PlusIcon className="h-4 w-4" />
            Add Subtasks
          </button>
        )}
      </div>
    </div>
  );
}
