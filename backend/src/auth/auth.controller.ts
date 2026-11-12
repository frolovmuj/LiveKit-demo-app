import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { CookieOptions, Request, Response } from 'express';

import { AuthService } from './auth.service.js';
import { LoginDto, RegisterDto } from './dto/auth.dto.js';
import { GithubAuthError, GithubAuthService } from './github-auth.service.js';

const OAUTH_STATE_MAX_AGE_MS = 10 * 60 * 1000;

const OAUTH_STATE_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/api/auth/github',
};

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly githubAuthService: GithubAuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...response } =
      await this.authService.signIn(loginDto);

    this.authService.addRefreshTokenToResponse(res, refreshToken);

    return response;
  }

  @Get('github')
  loginWithGithub(@Res() res: Response) {
    const state = this.githubAuthService.generateState();

    res.cookie(this.githubAuthService.STATE_COOKIE_NAME, state, {
      ...OAUTH_STATE_COOKIE_OPTIONS,
      maxAge: OAUTH_STATE_MAX_AGE_MS,
    });

    res.redirect(this.githubAuthService.getAuthorizeUrl(state));
  }

  @Get('github/callback')
  async githubCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Query('code') code?: string,
    @Query('state') state?: string,
  ) {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    const expectedState = req.cookies[this.githubAuthService.STATE_COOKIE_NAME];

    res.clearCookie(
      this.githubAuthService.STATE_COOKIE_NAME,
      OAUTH_STATE_COOKIE_OPTIONS,
    );

    try {
      if (!code || !state || state !== expectedState) {
        throw new GithubAuthError('invalid_state');
      }

      const { refreshToken } = await this.githubAuthService.signIn(code);
      this.authService.addRefreshTokenToResponse(res, refreshToken);

      res.redirect(frontendUrl);
    } catch (error) {
      if (!(error instanceof GithubAuthError)) {
        this.logger.error('GitHub OAuth failed', error);
      }

      const errorCode =
        error instanceof GithubAuthError ? error.code : 'github_error';

      res.redirect(`${frontendUrl}/login?error=${errorCode}`);
    }
  }

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...response } =
      await this.authService.signUp(registerDto);

    this.authService.addRefreshTokenToResponse(res, refreshToken);

    return response;
  }

  @Get('/update-token')
  async updateTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshTokenFromCookies =
      req.cookies[this.authService.REFRESH_TOKEN_NAME];

    if (!refreshTokenFromCookies) {
      this.authService.removeRefreshTokenFromResponse(res);
      throw new UnauthorizedException('Refresh token not passed');
    }

    const { refreshToken, ...response } = await this.authService.getNewTokens(
      refreshTokenFromCookies,
    );

    this.authService.addRefreshTokenToResponse(res, refreshToken);

    return response;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    this.authService.removeRefreshTokenFromResponse(res);
    return { ok: true };
  }
}
