export type AccentColor = 'amber' | 'blue' | 'pink' | 'rose' | 'emerald' | 'black';

export interface AccentOption {
  key: AccentColor;
  label: string;
  swatch: string; // matches the --accent value in globals.css
}

export const ACCENT_COLORS: AccentOption[] = [
  { key: 'amber', label: 'Amber', swatch: '#f59e0b' },
  { key: 'blue', label: 'Blue', swatch: '#3b82f6' },
  { key: 'pink', label: 'Pink', swatch: '#ec4899' },
  { key: 'rose', label: 'Rose', swatch: '#f43f5e' },
  { key: 'emerald', label: 'Emerald', swatch: '#10b981' },
  { key: 'black', label: 'Black', swatch: '#18181b' },
];

export const DEFAULT_ACCENT: AccentColor = 'black';
export const ACCENT_STORAGE_KEY = 'flowboard:accent';

export function isAccentColor(value: unknown): value is AccentColor {
  return typeof value === 'string' && ACCENT_COLORS.some((a) => a.key === value);
}

// Inlined as a <script> in the root layout, before hydration — reads
// localStorage synchronously and sets [data-accent] on <html> immediately,
// the same way next-themes' own injected script avoids a flash for
// light/dark. Kept as a plain string (not a .tsx component) since it has to
// run as a blocking, un-hydrated script tag.
export const ACCENT_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem(${JSON.stringify(ACCENT_STORAGE_KEY)});
    var valid = ${JSON.stringify(ACCENT_COLORS.map((a) => a.key))};
    var accent = valid.indexOf(stored) !== -1 ? stored : ${JSON.stringify(DEFAULT_ACCENT)};
    document.documentElement.setAttribute('data-accent', accent);
  } catch (e) {}
})();
`;
