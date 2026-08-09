import type { User } from '@/lib/types';

function initials(user: Pick<User, 'name' | 'email'>): string {
  const source = user.name?.trim() || user.email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

const SIZES = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
} as const;

export function Avatar({
  user,
  size = 'md',
}: {
  user: Pick<User, 'name' | 'email' | 'avatar'>;
  size?: keyof typeof SIZES;
}) {
  if (user.avatar) {
    return (
      // next/image is deliberately not used here: user.avatar is an arbitrary
      // URL off the User row, and next/image would need every possible host
      // whitelisted in images.remotePatterns or it throws at runtime. Avatars
      // are ~24-40px, so the optimization this gives up is negligible.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatar}
        alt={user.name ?? user.email}
        className={`${SIZES[size]} shrink-0 rounded-full object-cover`}
      />
    );
  }
  return (
    <div
      title={user.name ?? user.email}
      className={`${SIZES[size]} flex shrink-0 items-center justify-center rounded-full bg-zinc-200 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300`}
    >
      {initials(user)}
    </div>
  );
}
