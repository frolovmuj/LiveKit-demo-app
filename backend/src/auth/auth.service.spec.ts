import { refreshTokenCookieOptions } from './auth.service';

describe('refreshTokenCookieOptions', () => {
  const previousNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = previousNodeEnv;
  });

  it('marks the cookie secure only in production', () => {
    const expires = new Date('2026-01-01T00:00:00.000Z');

    process.env.NODE_ENV = 'production';
    expect(refreshTokenCookieOptions(expires).secure).toBe(true);

    process.env.NODE_ENV = 'development';
    expect(refreshTokenCookieOptions(expires).secure).toBe(false);
  });
});
