// Must match backend/src/auth/auth.types.ts's AUTH_COOKIE_NAME.
export const AUTH_COOKIE_NAME = 'flowboard_session';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
