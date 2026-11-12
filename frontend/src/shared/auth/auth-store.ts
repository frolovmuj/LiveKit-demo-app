import { makeAutoObservable } from 'mobx';

import type { AuthTokens, AuthUser } from './types';

export class AuthStore {
  user: AuthUser | null = null;
  accessToken: string | null = null;
  status: 'loading' | 'anonymous' | 'authenticated' = 'loading';

  constructor() {
    makeAutoObservable(this);
  }

  setAuth(auth: AuthTokens | null) {
    if (!auth) {
      this.clear();
      return;
    }

    this.user = auth.user;
    this.accessToken = auth.accessToken;
    this.status = 'authenticated';
  }

  clear() {
    this.user = null;
    this.accessToken = null;
    this.status = 'anonymous';
  }
}

export const authStore = new AuthStore();
