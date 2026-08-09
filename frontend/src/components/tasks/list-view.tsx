'use client';

import { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { DataTable, type Column } from '@/components/shared/data-table';
import type { FilterField } from '@/components/shared/fields-dropdown';
import { ChevronDownIcon, ChevronRightIcon } from '@/components/layout/icons';
import { ALL_STATUSES, PRIORITY_LABELS, STATUS_LABELS, type Priority, type Status, type Task } from '@/lib/types';
import { DueDateBadge, LabelPill, PriorityBadge } from './status-priority-badges';

// Priority and Status aren't here — per the Figma, those two are
// filter-only fields now (see TASK_FILTER_FIELDS below), not
// checkbox-toggled columns. Priority's column is always shown (matches its
// prior default-visible state); Status has no column at all in this view —
// see the comment in buildColumns for why.
export const TASK_FIELD_OPTIONS = [
  { key: 'members', label: 'Members' },
  { key: 'dueDate', label: 'Due Date' },
  { key: 'labels', label: 'Labels' },
  { key: 'reporter', label: 'Reporter' },
];

export const TASK_FILTER_FIELDS: FilterField[] = [
  {
    key: 'priority',
    label: 'Priority',
    values: (Object.keys(PRIORITY_LABELS) as Priority[]).map((key) => ({
      key,
      label: PRIORITY_LABELS[key],
    })),
  },
  {
    key: 'status',
    label: 'Status',
    values: (Object.keys(STATUS_LABELS) as Status[]).map((key) => ({
      key,
      label: STATUS_LABELS[key],
    })),
  },
];

function buildColumns(visible: Set<string>, onDelete: (id: string) => void): Column<Task>[] {
  const columns: Column<Task>[] = [
    { key: 'title', header: 'Task', render: (t) => (
      <span className="font-medium text-black dark:text-zinc-50">{t.title}</span>
    ) },
    { key: 'priority', header: 'Priority', render: (t) => <PriorityBadge priority={t.priority} /> },
  ];

  if (visible.has('members')) {
    columns.push({
      key: 'members',
      header: 'Members',
      render: (t) =>
        t.assignees.length ? (
          <div className="flex -space-x-1.5">
            {t.assignees.map((u) => (
              <Avatar key={u.id} user={u} size="sm" />
            ))}
          </div>
        ) : (
          <span className="text-zinc-400">—</span>
        ),
    });
  }
  if (visible.has('dueDate')) {
    columns.push({
      key: 'dueDate',
      header: 'Due Date',
      render: (t) => t.dueDate ? <DueDateBadge dueDate={t.dueDate} /> : <span className="text-zinc-400">—</span>,
    });
  }
  if (visible.has('labels')) {
    columns.push({
      key: 'labels',
      header: 'Labels',
      render: (t) =>
        t.labels.length ? (
          <div className="flex flex-wrap gap-1">
            {t.labels.map((l) => (
              <LabelPill key={l.id} name={l.name} />
            ))}
          </div>
        ) : (
          <span className="text-zinc-400">—</span>
        ),
    });
  }
  // No per-row Status column: rows are already grouped into per-status
  // sections below (every row in a section shares the same status, so a
  // column repeating it would be redundant) — Status is filter-only now,
  // via TASK_FILTER_FIELDS, same as it was hidden-by-default before.
  if (visible.has('reporter')) {
    // Not tracked in the data model yet (no createdBy/reporter field on
    // Task) — shown as a placeholder so the Figma's column set is still
    // represented. See architecture.md Known Deviations.
    columns.push({ key: 'reporter', header: 'Reporter', render: () => <span className="text-zinc-400">—</span> });
  }

  columns.push({
    key: 'actions',
    header: 'Actions',
    render: (t) => (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(t.id);
        }}
        className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
      >
        Delete
      </button>
    ),
  });

  return columns;
}

export function ListView({
  tasks,
  visibleFields,
  onDeleteTask,
  onOpenTask,
}: {
  tasks: Task[];
  visibleFields: Set<string>;
  onDeleteTask: (id: string) => void;
  onOpenTask?: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const columns = buildColumns(visibleFields, onDeleteTask);

  return (
    // min-h-0 lets this shrink below its content inside the page's flex
    // column — without it the scroll container is never shorter than what it
    // holds, so overflow-y-auto has nothing to scroll.
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
      {ALL_STATUSES.map((status) => {
        const sectionTasks = tasks.filter((t) => t.status === status);
        const isCollapsed = collapsed.has(status);
        // shrink-0 is what actually makes the list scrollable: as flex items
        // these cards default to shrinking, so a long list squeezed every
        // group down instead of overflowing, and overflow-hidden then clipped
        // the rows with no way to reach them.
        return (
          <div
            key={status}
            className="shrink-0 overflow-hidden rounded-lg border border-black/[.08] dark:border-white/[.145]"
          >
            <button
              type="button"
              onClick={() =>
                setCollapsed((prev) => {
                  const next = new Set(prev);
                  if (next.has(status)) next.delete(status);
                  else next.add(status);
                  return next;
                })
              }
              className="flex w-full items-center gap-2 bg-zinc-50 px-4 py-2 text-left text-sm font-medium text-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-300"
            >
              {isCollapsed ? (
                <ChevronRightIcon className="h-4 w-4 text-zinc-400" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 text-zinc-400" />
              )}
              {STATUS_LABELS[status]}
              <span className="rounded-full bg-zinc-200 px-1.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                {sectionTasks.length}
              </span>
            </button>
            {!isCollapsed && (
              <DataTable
                columns={columns}
                rows={sectionTasks}
                rowKey={(t) => t.id}
                onRowClick={onOpenTask ? (t) => onOpenTask(t.id) : undefined}
                emptyMessage="No tasks here."
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
