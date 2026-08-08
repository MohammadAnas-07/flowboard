import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser, JwtPayload } from './auth.types';

// Single reused demo account — guest login doesn't create a new user per click,
// it finds-or-creates this one fixed record and signs everyone into it.
const GUEST_EMAIL = 'guest@flowboard.demo';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async loginAsGuest(): Promise<{ user: AuthUser; token: string }> {
    const user = await this.prisma.user.upsert({
      where: { email: GUEST_EMAIL },
      update: {},
      create: {
        email: GUEST_EMAIL,
        name: 'Guest',
        isGuest: true,
      },
    });

    const payload: JwtPayload = { sub: user.id };
    const token = await this.jwtService.signAsync(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isGuest: user.isGuest,
        theme: user.theme,
        accentColor: user.accentColor,
      },
      token,
    };
  }
}
