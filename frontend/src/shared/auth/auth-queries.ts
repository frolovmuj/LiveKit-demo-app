import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { login, logout, register } from '@shared/api/auth';
import { ApiError, refreshAccessToken } from '@shared/api/client';
import { authQueryKey } from '@shared/api/query-client';

import { authStore } from './auth-store';

export function useAuthQuery() {
  return useQuery({
    queryKey: authQueryKey,
    queryFn: async () => {
      try {
        return await refreshAccessToken();
      } catch (error) {
        authStore.clear();

        if (error instanceof ApiError && error.status === 401) {
          return null;
        }

        throw error;
      }
    },
    enabled: typeof document !== 'undefined',
    retry: false,
    staleTime: Infinity,
  });
}

export function useLoginMutation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess(auth) {
      authStore.setAuth(auth);
      client.setQueryData(authQueryKey, auth);
    },
  });
}

export function useRegisterMutation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: register,
    onSuccess(auth) {
      authStore.setAuth(auth);
      client.setQueryData(authQueryKey, auth);
    },
  });
}

export function useLogoutMutation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess() {
      authStore.clear();
      client.setQueryData(authQueryKey, null);
    },
  });
}
