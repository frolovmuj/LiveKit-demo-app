import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import type { CookieOptions, Response } from 'express';

import { UsersService } from '../users/users.service.js';
import { LoginDto, RegisterDto } from './dto/auth.dto.js';

const SALT_ROUNDS = 10;
const REFRESH_TOKEN_EXPIRE_DAYS = 7;

function withoutPassword<T extends { password?: string | null }>(user: T) {
  const { password: _password, ...publicUser } = user;
  return publicUser;
}

export function refreshTokenCookieOptions(expires: Date): CookieOptions {
  return {
    httpOnly: true,
    expires,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  };
}

@Injectable()
export class AuthService {
  readonly REFRESH_TOKEN_NAME = 'refreshToken';

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async signIn(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);

    if (!user?.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatches = await bcrypt.compare(password, user.password);

    if (!isPasswordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.issueTokens(user.id);

    return {
      user: withoutPassword(user),
      ...tokens,
    };
  }

  async signUp(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const oldUser = await this.usersService.findByEmail(email);

    if (oldUser) {
      throw new BadRequestException('User already exists');
    }

    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    const tokens = this.issueTokens(user.id);

    return {
      user: withoutPassword(user),
      ...tokens,
    };
  }

  issueTokens(userId: number) {
    return {
      accessToken: this.jwtService.sign(
        { userId },
        {
          expiresIn: '1h',
        },
      ),
      refreshToken: this.jwtService.sign({ userId }, { expiresIn: '7d' }),
    };
  }

  async getNewTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{ userId: number }>(
        refreshToken,
      );
      const user = await this.usersService.findById(payload.userId);

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return {
        user: withoutPassword(user),
        ...this.issueTokens(user.id),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  addRefreshTokenToResponse(res: Response, refreshToken: string) {
    const expires = new Date();
    expires.setDate(expires.getDate() + REFRESH_TOKEN_EXPIRE_DAYS);

    res.cookie(
      this.REFRESH_TOKEN_NAME,
      refreshToken,
      refreshTokenCookieOptions(expires),
    );
  }

  removeRefreshTokenFromResponse(res: Response) {
    res.cookie(
      this.REFRESH_TOKEN_NAME,
      '',
      refreshTokenCookieOptions(new Date(0)),
    );
  }
}
