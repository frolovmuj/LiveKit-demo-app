import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { GitHub } from 'arctic';
import { randomBytes } from 'node:crypto';

import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';

export type GithubAuthErrorCode =
  'invalid_state' | 'github_error' | 'email_not_verified' | 'account_exists';

export class GithubAuthError extends Error {
  constructor(readonly code: GithubAuthErrorCode) {
    super(code);
  }
}

type GithubUser = {
  id: number;
  login: string;
  name: string | null;
};

type GithubEmail = {
  email: string;
  primary: boolean;
  verified: boolean;
};

@Injectable()
export class GithubAuthService {
  readonly STATE_COOKIE_NAME = 'oauth_state';

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  generateState() {
    return randomBytes(16).toString('hex');
  }

  getAuthorizeUrl(state: string) {
    return this.github()
      .createAuthorizationURL(state, ['read:user', 'user:email'])
      .toString();
  }

  async signIn(code: string) {
    const githubToken = await this.exchangeCode(code);
    const [githubUser, emails] = await Promise.all([
      this.githubGet<GithubUser>('/user', githubToken),
      this.githubGet<GithubEmail[]>('/user/emails', githubToken),
    ]);

    const githubId = String(githubUser.id);
    let user = await this.usersService.findByGithubId(githubId);

    if (!user) {
      const email = emails.find((e) => e.primary && e.verified)?.email;

      if (!email) {
        throw new GithubAuthError('email_not_verified');
      }

      if (await this.usersService.findByEmail(email)) {
        throw new GithubAuthError('account_exists');
      }

      user = await this.usersService.create({
        email,
        github_id: githubId,
        username: githubUser.login,
        name: githubUser.name,
      });
    }

    return {
      user,
      ...this.authService.issueTokens(user.id),
    };
  }

  private github() {
    return new GitHub(
      this.configService.getOrThrow('GITHUB_CLIENT_ID'),
      this.configService.getOrThrow('GITHUB_CLIENT_SECRET'),
      this.configService.getOrThrow('GITHUB_CALLBACK_URL'),
    );
  }

  private async exchangeCode(code: string) {
    try {
      const tokens = await this.github().validateAuthorizationCode(code);
      return tokens.accessToken();
    } catch {
      throw new GithubAuthError('github_error');
    }
  }

  private async githubGet<T>(path: string, token: string): Promise<T> {
    const res = await fetch(`https://api.github.com${path}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new GithubAuthError('github_error');
    }

    return res.json() as Promise<T>;
  }
}
