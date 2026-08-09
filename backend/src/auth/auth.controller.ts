import {
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { AUTH_COOKIE_NAME, type AuthUser } from './auth.types';
import { CurrentUser } from './decorators/current-user.decorator';

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 100 requests per 15 minutes per IP (configured in AppModule). This route
  // is unauthenticated and does real work on every call — a DB find-or-create
  // plus a JWT signature — so it's the obvious thing to hammer. Apply the
  // same @UseGuards(ThrottlerGuard) to the Google OAuth callback when that
  // lands; it'll be unauthenticated and public for the same reasons.
  @Public()
  @UseGuards(ThrottlerGuard)
  @Post('guest')
  @HttpCode(200)
  async guestLogin(@Res({ passthrough: true }) res: Response) {
    const { user, token } = await this.authService.loginAsGuest();
    setSessionCookie(res, token);
    return { user };
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return { user };
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: true,
      secure: isProd(),
      sameSite: isProd() ? 'none' : 'lax',
      path: '/',
    });
    return { success: true };
  }
}

function isProd(): boolean {
  return process.env.NODE_ENV === 'production';
}

function setSessionCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    // Secure + SameSite=None is required for the cross-origin Vercel<->Render
    // cookie flow in production, but Secure cookies are rejected by browsers
    // over plain http — so this relaxes to Lax/non-secure for local dev,
    // where frontend and backend are both on http://localhost (same-site,
    // different ports, so Lax still sends the cookie on fetch calls).
    secure: isProd(),
    sameSite: isProd() ? 'none' : 'lax',
    maxAge: COOKIE_MAX_AGE_MS,
    path: '/',
  });
}
