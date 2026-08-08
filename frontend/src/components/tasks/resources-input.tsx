'use client';

import { useState } from 'react';
import { PlusIcon } from '@/components/layout/icons';

interface ResourcesInputProps {
  resourceUrl: string | null;
  onChange: (resourceUrl: string) => void;
}

/** Single document/link field — no file upload, no multiple resources (see
 * task spec: "store as a simple URL/text field on the task for now"). */
export function ResourcesInput({ resourceUrl, onChange }: ResourcesInputProps) {
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState('');

  if (resourceUrl) {
    return (
      <div className="flex items-center gap-2">
        <a
          href={resourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate text-sm text-blue-600 underline dark:text-blue-400"
        >
          {resourceUrl}
        </a>
        <button
          type="button"
          onClick={() => onChange('')}
          className="text-xs text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
        >
          Remove
        </button>
      </div>
    );
  }

  if (adding) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) {
            onChange(value.trim());
            setAdding(false);
            setValue('');
          }
        }}
        className="flex gap-2"
      >
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && setAdding(false)}
          placeholder="Paste a document or link URL…"
          className="flex-1 rounded border border-black/[.08] bg-transparent px-2 py-1 text-sm outline-none dark:border-white/[.145]"
        />
        <button type="submit" className="rounded bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
          Add
        </button>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setAdding(true)}
      className="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
    >
      <PlusIcon className="h-4 w-4" />
      Add document or link
    </button>
  );
}
