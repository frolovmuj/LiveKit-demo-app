import type { AuthTokens } from '@shared/auth/types';

import { API_URL, ApiError, api } from './client';

export type { AuthTokens, AuthUser } from '@shared/auth/types';
export { ApiError };

const githubErrors: Record<string, string> = {
  invalid_state: 'Вход через GitHub не удался. Попробуйте ещё раз.',
  github_error: 'GitHub не ответил. Попробуйте ещё раз.',
  email_not_verified:
    'У GitHub нет подтверждённой почты. Подтвердите её и войдите снова.',
  account_exists: 'Аккаунт с этой почтой уже есть. Войдите по паролю.',
};

export function githubAuthorizeUrl() {
  return `${API_URL}/api/auth/github`;
}

export function githubErrorMessage(code: string | null) {
  if (!code) {
    return null;
  }

  return githubErrors[code] ?? 'Вход через GitHub не удался. Попробуйте ещё раз.';
}

export async function login(input: { email: string; password: string }) {
  try {
    const { data } = await api.post<AuthTokens>('/api/auth/login', input);
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw new ApiError('Неверная почта или пароль', 401);
    }

    throw error;
  }
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    const { data } = await api.post<AuthTokens>('/api/auth/register', input);
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      throw new ApiError(
        error.message === 'User already exists'
          ? 'Аккаунт с этой почтой уже есть.'
          : error.message,
        400,
      );
    }

    throw error;
  }
}

export async function logout() {
  await api.post('/api/auth/logout');
}
