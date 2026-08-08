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
 * column visibility), the Projects list page, and the project-detail page's
 * grouped-by-status tables — same rendering, different column sets.
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

  return (
    <div className="overflow-x-auto">
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
  );
}
