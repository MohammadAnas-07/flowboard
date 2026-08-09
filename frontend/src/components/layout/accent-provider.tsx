'use client';

import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { notifyStoredPreferenceChange, useStoredPreference } from '@/lib/stored-preference';
import { ACCENT_STORAGE_KEY, DEFAULT_ACCENT, isAccentColor, type AccentColor } from '@/lib/theme';

interface AccentContextValue {
  accent: AccentColor;
  setAccent: (accent: AccentColor) => void;
}

const AccentContext = createContext<AccentContextValue | null>(null);

function parseAccent(raw: string | null): AccentColor {
  return isAccentColor(raw) ? raw : DEFAULT_ACCENT;
}

export function AccentProvider({ children }: { children: ReactNode }) {
  // The pre-hydration script (see lib/theme.ts) already set the correct
  // [data-accent] attribute and localStorage value before this ever mounts —
  // this reads the same value straight out of storage rather than starting on
  // the default and correcting itself in an effect.
  const accent = useStoredPreference(ACCENT_STORAGE_KEY, parseAccent, DEFAULT_ACCENT);

  const setAccent = useCallback((next: AccentColor) => {
    localStorage.setItem(ACCENT_STORAGE_KEY, next);
    document.documentElement.setAttribute('data-accent', next);
    notifyStoredPreferenceChange();
  }, []);

  return (
    <AccentContext.Provider value={{ accent, setAccent }}>{children}</AccentContext.Provider>
  );
}

export function useAccent(): AccentContextValue {
  const ctx = useContext(AccentContext);
  if (!ctx) throw new Error('useAccent must be used within AccentProvider');
  return ctx;
}
