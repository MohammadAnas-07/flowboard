'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { ACCENT_STORAGE_KEY, DEFAULT_ACCENT, isAccentColor, type AccentColor } from '@/lib/theme';

interface AccentContextValue {
  accent: AccentColor;
  setAccent: (accent: AccentColor) => void;
}

const AccentContext = createContext<AccentContextValue | null>(null);

export function AccentProvider({ children }: { children: ReactNode }) {
  // The pre-hydration script (see lib/theme.ts) already set the correct
  // [data-accent] attribute and localStorage value before this ever mounts —
  // this just needs to agree with it on first render to avoid a mismatch.
  const [accent, setAccentState] = useState<AccentColor>(DEFAULT_ACCENT);

  useEffect(() => {
    const stored = localStorage.getItem(ACCENT_STORAGE_KEY);
    if (isAccentColor(stored)) setAccentState(stored);
  }, []);

  const setAccent = useCallback((next: AccentColor) => {
    setAccentState(next);
    localStorage.setItem(ACCENT_STORAGE_KEY, next);
    document.documentElement.setAttribute('data-accent', next);
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
