import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// DTOs
export class RegisterDto {
  username: string;
  email?: string;
  phone?: string;
  password: string;
  nickname?: string;
}

export class LoginDto {
  account: string; // 用户名/邮箱/手机号
  password: string;
}

export class RefreshTokenDto {
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * 用户注册
   */
  async register(dto: RegisterDto) {
    // 校验：邮箱或手机号至少有一个
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('邮箱或手机号至少填写一个');
    }

    // 检查用户名唯一性
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: dto.username },
          dto.email ? { email: dto.email } : undefined,
          dto.phone ? { phone: dto.phone } : undefined,
        ].filter(Boolean),
      },
    });

    if (existingUser) {
      throw new ConflictException('用户名、邮箱或手机号已存在');
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        uuid: uuidv4(),
        username: dto.username,
        email: dto.email,
        phone: dto.phone,
        password: hashedPassword,
        nickname: dto.nickname || dto.username,
      },
      select: {
        id: true,
        uuid: true,
        username: true,
        email: true,
        phone: true,
        nickname: true,
        avatar: true,
        createdAt: true,
      },
    });

    // 生成 Token
    const tokens = await this.generateTokens(user.id, user.uuid);

    return {
      user,
      ...tokens,
    };
  }

  /**
   * 用户登录
   */
  async login(dto: LoginDto) {
    // 查找用户（支持用户名/邮箱/手机号）
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: dto.account },
          { email: dto.account },
          { phone: dto.account },
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException('账号或密码错误');
    }

    if (user.status === 0) {
      throw new UnauthorizedException('账号已被禁用');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('账号或密码错误');
    }

    // 更新最后登录时间
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 生成 Token
    const tokens = await this.generateTokens(user.id, user.uuid);

    return {
      user: {
        id: user.id,
        uuid: user.uuid,
        username: user.username,
        email: user.email,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
      },
      ...tokens,
    };
  }

  /**
   * 刷新 Token
   */
  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.status === 0) {
        throw new UnauthorizedException('用户不存在或已被禁用');
      }

      const tokens = await this.generateTokens(user.id, user.uuid);
      return tokens;
    } catch {
      throw new UnauthorizedException('Refresh Token 无效或已过期');
    }
  }

  /**
   * 退出登录（可选：加入黑名单）
   */
  async logout(userId: number) {
    // TODO: 将 token 加入 Redis 黑名单
    return { message: '退出成功' };
  }

  /**
   * 生成 Access Token + Refresh Token
   */
  private async generateTokens(userId: number, userUuid: string) {
    const payload = { sub: userId, uuid: userUuid };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpiresIn'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get('jwt.expiresIn'),
    };
  }

  /**
   * 验证用户（JWT 策略调用）
   */
  async validateUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        uuid: true,
        username: true,
        email: true,
        status: true,
      },
    });

    if (!user || user.status === 0) {
      return null;
    }

    return user;
  }
}
