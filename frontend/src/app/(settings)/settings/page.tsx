import { redirect } from 'next/navigation';
import { SettingsView } from '@/components/settings/settings-view';
import { getCurrentUser } from '@/lib/auth-server';

// Deliberately outside the (app) route group — the settings page has its
// own "Back to app" + left nav chrome (see SettingsView) instead of the
// main app Sidebar, so it can't just nest under (app)/layout.tsx. That
// means it needs its own auth check, mirroring (app)/layout.tsx's.
export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <SettingsView user={user} />;
}
