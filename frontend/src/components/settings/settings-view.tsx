'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronLeftIcon } from '@/components/layout/icons';
import { ColorModeOptions, ThemeModeOptions } from '@/components/layout/theme-options';
import { ACCENT_COLORS, DEFAULT_ACCENT } from '@/lib/theme';
import type { User } from '@/lib/types';

type Section = 'profile' | 'theme' | 'color';

const NAV_ITEMS: { key: Section; label: string }[] = [
  { key: 'profile', label: 'Profile' },
  { key: 'theme', label: 'Theme' },
  { key: 'color', label: 'Color' },
];

const PANEL_OPTION_CLASS =
  'flex w-full cursor-pointer items-center gap-2 rounded-lg border border-black/[.08] px-3 py-2.5 text-left text-sm text-zinc-700 outline-none transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-300 dark:hover:bg-white/[.08]';

// Own left nav + "Back to app" link — this page intentionally does not sit
// inside the main app Sidebar (see app/(settings)/settings/page.tsx for why
// it's routed outside the (app) group).
export function SettingsView({ user }: { user: User }) {
  const [section, setSection] = useState<Section>('profile');

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-black">
      <aside className="flex w-60 shrink-0 flex-col border-r border-black/[.08] dark:border-white/[.145]">
        <div className="border-b border-black/[.08] px-4 py-4 dark:border-white/[.145]">
          <Link
            href="/tasks"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            <ChevronLeftIcon className="h-4 w-4 shrink-0" />
            Back to app
          </Link>
        </div>
        <nav className="flex flex-col gap-0.5 px-2 py-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setSection(item.key)}
              aria-current={section === item.key}
              className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                section === item.key
                  ? 'bg-accent/10 text-accent'
                  : 'text-zinc-600 hover:bg-black/[.04] dark:text-zinc-400 dark:hover:bg-white/[.08]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto px-8 py-10">
        <div className="mx-auto max-w-lg">
          {section === 'profile' && <ProfileSection user={user} />}
          {section === 'theme' && (
            <SectionShell title="Theme" description="Choose how Flowboard looks on this device.">
              <div className="flex flex-col gap-2">
                <ThemeModeOptions
                  renderOption={({ key, onSelect, content }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={onSelect}
                      className={PANEL_OPTION_CLASS}
                    >
                      {content}
                    </button>
                  )}
                />
              </div>
            </SectionShell>
          )}
          {section === 'color' && (
            <SectionShell title="Color" description="Pick the accent color used across buttons and highlights.">
              <div className="flex flex-col gap-2">
                <ColorModeOptions
                  renderOption={({ key, onSelect, content }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={onSelect}
                      className={PANEL_OPTION_CLASS}
                    >
                      {content}
                    </button>
                  )}
                />
              </div>
            </SectionShell>
          )}
        </div>
      </main>
    </div>
  );
}

function SectionShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-black dark:text-zinc-50">{title}</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">{description}</p>
      </div>
      {children}
    </div>
  );
}

function initialsFrom(name: string, email: string): string {
  const source = name.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

const DEFAULT_AVATAR_SWATCH =
  ACCENT_COLORS.find((a) => a.key === DEFAULT_ACCENT)?.swatch ?? ACCENT_COLORS[0].swatch;

// Everything here is session-local — see architecture.md's Known
// Deviations. Flowboard's guest login always resolves to the same shared
// demo User row, so there's no per-user record to persist these edits to
// without one guest's changes leaking into another guest's session.
// Component state only (not localStorage), so a reload or a fresh guest
// session both reset to defaults, same as the rest of the profile fields.
function ProfileSection({ user }: { user: User }) {
  const [avatarColor, setAvatarColor] = useState(DEFAULT_AVATAR_SWATCH);
  const [name, setName] = useState(user.name ?? '');
  const [email, setEmail] = useState(user.email);
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState(user.email.split('@')[0] ?? '');

  return (
    <SectionShell title="Profile" description="These changes stay on this device for this session only.">
      <div>
        <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Profile picture
        </span>
        <div className="flex items-center gap-4">
          <div
            style={{ backgroundColor: avatarColor }}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-medium text-white"
          >
            {initialsFrom(name, email)}
          </div>
          <div className="flex gap-2">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.key}
                type="button"
                onClick={() => setAvatarColor(color.swatch)}
                title={color.label}
                aria-label={`Use ${color.label} avatar color`}
                aria-pressed={avatarColor === color.swatch}
                className={`h-6 w-6 shrink-0 rounded-full border-2 transition-colors ${
                  avatarColor === color.swatch
                    ? 'border-accent'
                    : 'border-transparent hover:border-black/[.15] dark:hover:border-white/[.25]'
                }`}
                style={{ backgroundColor: color.swatch }}
              />
            ))}
          </div>
        </div>
      </div>

      <Field label="Full name" value={name} onChange={setName} placeholder="Your name" />

      <div>
        <Field label="Email" value={email} onChange={setEmail} type="email" />
        <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-500">
          Cosmetic only — editing this does not change your guest login identity.
        </p>
      </div>

      <Field label="Title" value={title} onChange={setTitle} placeholder="e.g. Product Designer" />
      <Field label="Username" value={username} onChange={setUsername} placeholder="username" />

      <div className="mt-2 border-t border-black/[.08] pt-6 dark:border-white/[.145]">
        <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Workspace
        </span>
        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Not available in guest mode — Flowboard runs on a single shared guest account, so there's no individual workspace membership to leave."
          className="cursor-not-allowed rounded-full border border-black/[.08] bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-400 dark:border-white/[.145] dark:bg-zinc-900 dark:text-zinc-600"
        >
          Leave Workspace
        </button>
        <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-500">
          Not available in guest mode.
        </p>
      </div>
    </SectionShell>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-black/[.08] bg-white px-3 py-2 text-sm text-black outline-none focus:border-accent dark:border-white/[.145] dark:bg-zinc-900 dark:text-zinc-50"
      />
    </label>
  );
}
