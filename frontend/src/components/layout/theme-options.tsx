'use client';

import type { ReactNode } from 'react';
import { useTheme } from 'next-themes';
import { ACCENT_COLORS } from '@/lib/theme';
import { useAccent } from './accent-provider';
import { CheckIcon } from './icons';

// Shared option list + selection state for "Change Theme" (Light/Dark) and
// "Color Mode" (accent), used by both the sidebar user-menu dropdown and the
// /settings page. Each consumer supplies its own `renderOption` — a Radix
// DropdownMenu.Item in the menu, a plain button on the settings page — so
// the two surfaces render the exact same options/labels/swatches/selection
// logic without either place hand-rolling its own copy.

export function CheckSlot({ show }: { show: boolean }) {
  return (
    <span className="flex h-4 w-4 items-center justify-center">
      {show && <CheckIcon className="h-3.5 w-3.5" />}
    </span>
  );
}

export interface ThemeOption {
  key: string;
  selected: boolean;
  onSelect: () => void;
  content: ReactNode;
}

export function ThemeModeOptions({
  renderOption,
}: {
  renderOption: (option: ThemeOption) => ReactNode;
}) {
  // resolvedTheme (not theme) — theme defaults to 'system' until the user
  // explicitly picks Light/Dark, but the page is always visually in one or
  // the other, and the selected state should match what's actually on screen.
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <>
      {(['light', 'dark'] as const).map((mode) =>
        renderOption({
          key: mode,
          selected: resolvedTheme === mode,
          onSelect: () => setTheme(mode),
          content: (
            <>
              <CheckSlot show={resolvedTheme === mode} />
              {mode === 'light' ? 'Light' : 'Dark'}
            </>
          ),
        }),
      )}
    </>
  );
}

export function ColorModeOptions({
  renderOption,
}: {
  renderOption: (option: ThemeOption) => ReactNode;
}) {
  const { accent, setAccent } = useAccent();

  return (
    <>
      {ACCENT_COLORS.map((option) =>
        renderOption({
          key: option.key,
          selected: accent === option.key,
          onSelect: () => setAccent(option.key),
          content: (
            <>
              <CheckSlot show={accent === option.key} />
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/[.08] dark:border-white/[.15]"
                style={{ backgroundColor: option.swatch }}
              />
              {option.label}
            </>
          ),
        }),
      )}
    </>
  );
}
