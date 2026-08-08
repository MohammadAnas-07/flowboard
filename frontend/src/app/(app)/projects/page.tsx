'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { DataTable, type Column } from '@/components/shared/data-table';
import { PriorityBadge } from '@/components/tasks/status-priority-badges';
import { ApiError, deleteProject, getProjects } from '@/lib/api';
import type { Project } from '@/lib/types';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    const previous = projects;
    setProjects((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteProject(id);
    } catch (err) {
      setProjects(previous);
      setError(err instanceof ApiError ? err.message : 'Could not delete project — reverted.');
    }
  }

  const columns: Column<Project>[] = [
    {
      key: 'name',
      header: 'Projects',
      render: (p) => <span className="font-medium text-black dark:text-zinc-50">{p.name}</span>,
    },
    { key: 'priority', header: 'Priority', render: (p) => <PriorityBadge priority={p.priority} /> },
    {
      key: 'lead',
      header: 'Lead',
      render: (p) =>
        p.lead ? (
          <div className="flex items-center gap-2">
            <Avatar user={p.lead} size="sm" />
            <span>{p.lead.name ?? p.lead.email}</span>
          </div>
        ) : (
          <span className="text-zinc-400">—</span>
        ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (p) =>
        p.dueDate ? (
          new Date(p.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        ) : (
          <span className="text-zinc-400">—</span>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (p) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(p.id);
          }}
          className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-black/[.08] px-6 py-4 dark:border-white/[.145]">
        <h1 className="text-lg font-semibold text-black dark:text-zinc-50">Projects</h1>
      </header>

      {error && (
        <div className="flex items-center justify-between bg-red-50 px-6 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          {error}
          <button type="button" onClick={() => setError(null)} className="font-medium underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">Loading…</div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-black/[.08] dark:border-white/[.145]">
            <DataTable
              columns={columns}
              rows={projects}
              rowKey={(p) => p.id}
              onRowClick={(p) => router.push(`/projects/${p.id}`)}
              emptyMessage="No projects yet."
            />
          </div>
        )}
      </div>
    </div>
  );
}
