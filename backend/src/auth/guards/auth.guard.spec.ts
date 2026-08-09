import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { AUTH_COOKIE_NAME } from '../auth.types';
import { AuthGuard } from './auth.guard';

// This guard is the actual security boundary (architecture.md Section 4),
// not the frontend's presence-only redirect check — worth testing directly
// with everything it touches (JwtService, PrismaService) mocked out.
function buildContext(cookies: Record<string, string> = {}) {
  const request: { cookies: Record<string, string>; user?: unknown } = {
    cookies,
  };
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  let jwtService: { verifyAsync: jest.Mock };
  let prisma: { user: { findUnique: jest.Mock } };
  let reflector: { getAllAndOverride: jest.Mock };
  let guard: AuthGuard;

  beforeEach(() => {
    jwtService = { verifyAsync: jest.fn() };
    prisma = { user: { findUnique: jest.fn() } };
    reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) };
    guard = new AuthGuard(
      jwtService as unknown as JwtService,
      prisma as unknown as PrismaService,
      reflector as unknown as Reflector,
    );
  });

  it('allows the request through without checking auth when the route is @Public()', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const context = buildContext();

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('rejects when there is no session cookie', async () => {
    const context = buildContext();

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects when the JWT fails verification', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('bad signature'));
    const context = buildContext({ [AUTH_COOKIE_NAME]: 'garbage-token' });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects when the JWT is valid but the user no longer exists', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: 'user-1' });
    prisma.user.findUnique.mockResolvedValue(null);
    const context = buildContext({ [AUTH_COOKIE_NAME]: 'valid-token' });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('allows the request through and attaches the user when the token and user are both valid', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: 'user-1' });
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'guest@flowboard.demo',
      name: 'Guest',
      avatar: null,
      isGuest: true,
      theme: 'system',
      accentColor: null,
    });
    const request: { cookies: Record<string, string>; user?: unknown } = {
      cookies: { [AUTH_COOKIE_NAME]: 'valid-token' },
    };
    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual(
      expect.objectContaining({ id: 'user-1', email: 'guest@flowboard.demo' }),
    );
  });
});
