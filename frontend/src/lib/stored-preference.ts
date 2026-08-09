'use client';

import { useSyncExternalStore } from 'react';

// Reading localStorage into state from an effect works, but it means every
// preference costs an extra render pass and trips react-hooks/set-state-in-effect.
// useSyncExternalStore is the sanctioned way to read a client-only store: React
// calls getServerSnapshot on the server and during hydration, then swaps to the
// real value, so there's no setState-in-effect and no hydration mismatch.

const listeners = new Set<() => void>();

/**
 * Tell every hook reading a stored preference that one just changed.
 * Call this after writing to localStorage in the same tab — the browser's
 * `storage` event only fires for *other* tabs.
 */
export function notifyStoredPreferenceChange(): void {
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener('storage', onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
}

/**
 * Read a localStorage-backed preference.
 *
 * `parse` must return a value that's stable under Object.is while storage is
 * unchanged — return a primitive, not a fresh object or array, or React will
 * re-render in a loop.
 */
export function useStoredPreference<T>(
  key: string,
  parse: (raw: string | null) => T,
  serverValue: T,
): T {
  return useSyncExternalStore(
    subscribe,
    () => parse(localStorage.getItem(key)),
    () => serverValue,
  );
}

/**
 * False on the server and through hydration, true afterwards. Useful for the
 * bits of layout that can't be rendered correctly until client-only state is
 * readable, and would otherwise flash the wrong value.
 */
export function useHasHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
