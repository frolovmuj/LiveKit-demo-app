import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
  isAxiosError,
} from 'axios';

import { authStore } from '@shared/auth/auth-store';
import type { AuthTokens } from '@shared/auth/types';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const refreshPath = '/api/auth/update-token';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

let refreshing: Promise<AuthTokens> | null = null;

export function refreshAccessToken() {
  if (!refreshing) {
    refreshing = api
      .get<AuthTokens>(refreshPath, { _retry: true } as RetryConfig)
      .then((response) => {
        authStore.setAuth(response.data);
        return response.data;
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) {
          authStore.clear();
        }

        throw error;
      })
      .finally(() => {
        refreshing = null;
      });
  }

  return refreshing;
}

api.interceptors.request.use((config) => {
  const token = authStore.accessToken;

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!isAxiosError(error) || !error.config) {
      return Promise.reject(new ApiError('Нет ответа от сервера', 0));
    }

    const config = error.config as RetryConfig;

    if (shouldRefresh(config, error.response?.status)) {
      config._retry = true;

      try {
        const auth = await refreshAccessToken();
        config.headers.set('Authorization', `Bearer ${auth.accessToken}`);
        return api.request(config);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(toApiError(error));
  },
);

function shouldRefresh(config: RetryConfig, status: number | undefined) {
  if (status !== 401 || config._retry) {
    return false;
  }

  const url = config.url ?? '';

  return (
    !url.includes(refreshPath) &&
    !url.includes('/api/auth/login') &&
    !url.includes('/api/auth/register') &&
    !url.includes('/api/auth/logout')
  );
}

function toApiError(error: AxiosError) {
  return new ApiError(
    messageFrom(error.response?.data, 'Запрос не выполнен'),
    error.response?.status ?? 0,
  );
}

function messageFrom(data: unknown, fallback: string) {
  if (data && typeof data === 'object' && 'message' in data) {
    const message = data.message;

    if (typeof message === 'string') {
      return message;
    }

    if (Array.isArray(message) && typeof message[0] === 'string') {
      return message[0];
    }
  }

  return fallback;
}
