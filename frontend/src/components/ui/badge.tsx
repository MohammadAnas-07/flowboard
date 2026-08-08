import type { ReactNode } from 'react';

export function Badge({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-black/[.08] px-2 py-0.5 text-xs font-medium text-zinc-700 dark:border-white/[.145] dark:text-zinc-300 ${className}`}
    >
      {children}
    </span>
  );
}
