'use client';

import { useState } from 'react';

interface EditableTitleDescriptionProps {
  title: string;
  description: string | null;
  onSaveTitle: (title: string) => void;
  onSaveDescription: (description: string) => void;
}

/** Inline-editable title/description — saves on blur, not on every
 * keystroke (local state while typing, PATCH only fires once focus leaves
 * the field and the value actually changed). */
export function EditableTitleDescription({
  title,
  description,
  onSaveTitle,
  onSaveDescription,
}: EditableTitleDescriptionProps) {
  const [titleValue, setTitleValue] = useState(title);
  const [descValue, setDescValue] = useState(description ?? '');

  return (
    <div className="flex flex-col gap-2">
      <input
        value={titleValue}
        onChange={(e) => setTitleValue(e.target.value)}
        onBlur={() => {
          if (titleValue.trim() && titleValue !== title) onSaveTitle(titleValue.trim());
        }}
        className="w-full rounded bg-transparent text-2xl font-semibold text-black outline-none focus:bg-black/[.03] dark:text-zinc-50 dark:focus:bg-white/[.06]"
      />
      <textarea
        value={descValue}
        onChange={(e) => setDescValue(e.target.value)}
        onBlur={() => {
          if (descValue !== (description ?? '')) onSaveDescription(descValue);
        }}
        placeholder="Add a description…"
        rows={3}
        className="w-full resize-none rounded bg-transparent text-sm text-zinc-600 outline-none placeholder:text-zinc-400 focus:bg-black/[.03] dark:text-zinc-400 dark:focus:bg-white/[.06]"
      />
    </div>
  );
}
