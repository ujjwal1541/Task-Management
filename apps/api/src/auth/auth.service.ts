import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  /** Guest login: reuses the seeded demo account so the workspace is never empty. */
  async guestLogin() {
    let user = await this.prisma.user.findFirst({ where: { email: 'dexter@gmail.com' } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: `guest-${Date.now()}@example.com`,
          name: 'Guest',
          username: 'guest',
          title: 'Guest',
          isGuest: true,
        },
      });
    }
    return { token: await this.sign(user.id, user.email), user };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private sign(sub: string, email: string) {
    return this.jwt.signAsync({ sub, email });
  }
}
