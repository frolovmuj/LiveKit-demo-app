export type AuthUser = {
  id: number;
  email: string;
  name: string | null;
  username: string | null;
};

export type AuthTokens = {
  user: AuthUser;
  accessToken: string;
};
