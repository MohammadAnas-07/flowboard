import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { AUTH_COOKIE_NAME, AuthUser, JwtPayload } from '../auth.types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // Express types `cookies` as `any`, which makes the token read below an
    // unsafe assignment. Intersecting isn't enough (any & T is still any), so
    // Omit it off the base type first, then re-add it properly typed.
    const request = context.switchToHttp().getRequest<
      Omit<Request, 'cookies'> & {
        user: AuthUser;
        cookies?: Record<string, string | undefined>;
      }
    >();
    const token: string | undefined = request.cookies?.[AUTH_COOKIE_NAME];

    if (!token) {
      throw new UnauthorizedException('No session cookie present');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired session');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    request.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      isGuest: user.isGuest,
      theme: user.theme,
      accentColor: user.accentColor,
    };
    return true;
  }
}
