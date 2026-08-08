'use client';

import { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import type { Comment } from '@/lib/types';

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function CommentsThread({
  comments,
  onAdd,
}: {
  comments: Comment[];
  onAdd: (body: string) => void;
}) {
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    await onAdd(body.trim());
    setBody('');
    setSubmitting(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {comments.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-500">No comments yet.</p>
        )}
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-2.5">
            <Avatar user={comment.author} size="sm" />
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-black dark:text-zinc-50">
                  {comment.author.name ?? comment.author.email}
                </span>
                <span className="text-xs text-zinc-400 dark:text-zinc-600">
                  {formatTimestamp(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{comment.body}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="flex flex-col gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment…"
          rows={2}
          className="w-full resize-none rounded-lg border border-black/[.08] bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-black/[.2] dark:border-white/[.145] dark:focus:border-white/[.3]"
        />
        <button
          type="submit"
          disabled={submitting || !body.trim()}
          className="self-end rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground disabled:opacity-50"
        >
          {submitting ? 'Posting…' : 'Add a comment'}
        </button>
      </form>
    </div>
  );
}
