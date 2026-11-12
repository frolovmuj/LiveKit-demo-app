import { useAuthQuery } from './auth-queries';

export function AuthLoader() {
  useAuthQuery();
  return null;
}
