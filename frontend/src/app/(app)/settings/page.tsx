export default function SettingsPage() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center border-b border-black/[.08] px-6 py-4 dark:border-white/[.145]">
        <h1 className="text-lg font-semibold text-black dark:text-zinc-50">Settings</h1>
      </header>
      <div className="flex flex-1 items-center justify-center px-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          Settings — not built yet. Theme and Color Mode are already live from the
          account menu in the sidebar.
        </p>
      </div>
    </div>
  );
}
