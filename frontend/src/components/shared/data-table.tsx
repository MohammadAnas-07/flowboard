'use client';

import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

/**
 * Generic table: caller supplies column definitions + rows, table just lays
 * them out. Reused by the Tasks list view (with Fields-dropdown-controlled
 * column visibility), the Projects list page, and the subtasks table — same
 * rendering, different column sets.
 *
 * Below 640px this renders as stacked cards instead of a table — a 5-column
 * table shrunk to fit a phone is unreadable no matter the font size. Both
 * layouts are rendered and toggled with Tailwind's `sm:` variant rather than
 * a JS viewport check, so there's no hydration mismatch and no layout flash.
 * The first column is treated as the row's heading; a column keyed
 * `"actions"` (every current caller has one) is pulled out and placed next
 * to it instead of listed as a label/value row.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  emptyMessage = 'Nothing here yet.',
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-500">
        {emptyMessage}
      </div>
    );
  }

  const [primaryColumn, ...otherColumns] = columns;
  const actionsColumn = otherColumns.find((col) => col.key === 'actions');
  const detailColumns = otherColumns.filter((col) => col.key !== 'actions');

  return (
    <>
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-black/[.08] text-left text-xs font-medium uppercase tracking-wide text-zinc-400 dark:border-white/[.145] dark:text-zinc-600">
              {columns.map((col) => (
                <th key={col.key} className={`px-4 py-2 font-medium ${col.className ?? ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-black/[.06] last:border-0 dark:border-white/[.08] ${
                  onRowClick ? 'cursor-pointer hover:bg-black/[.02] dark:hover:bg-white/[.04]' : ''
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-2.5 align-middle ${col.className ?? ''}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 p-2 sm:hidden">
        {rows.map((row) => (
          <div
            key={rowKey(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={`rounded-lg border border-black/[.08] p-3 dark:border-white/[.145] ${
              onRowClick ? 'cursor-pointer active:bg-black/[.02] dark:active:bg-white/[.04]' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 text-sm font-medium text-black dark:text-zinc-50">
                {primaryColumn.render(row)}
              </div>
              {actionsColumn && (
                <div onClick={(e) => e.stopPropagation()}>{actionsColumn.render(row)}</div>
              )}
            </div>
            {detailColumns.length > 0 && (
              <div className="mt-2.5 flex flex-col gap-1.5 border-t border-black/[.06] pt-2.5 dark:border-white/[.08]">
                {detailColumns.map((col) => (
                  <div key={col.key} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-600">
                      {col.header}
                    </span>
                    <div>{col.render(row)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
