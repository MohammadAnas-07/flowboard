export interface JwtPayload {
  sub: string; // user id
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  isGuest: boolean;
  theme: string | null;
  accentColor: string | null;
}

export const AUTH_COOKIE_NAME = 'flowboard_session';
