import { Link } from 'react-router';

import { observer } from 'mobx-react-lite';

import { useLogoutMutation } from '@shared/auth/auth-queries';
import { authStore } from '@shared/auth/auth-store';
import { Button, buttonVariants } from '@shared/ui/Button';

export const Header = observer(() => {
  const logoutMutation = useLogoutMutation();
  const label = authStore.user?.name || authStore.user?.email;

  return (
    <header className="flex items-center justify-end gap-3 px-4 py-3 sm:px-10">
      {authStore.status === 'authenticated' && label ? (
        <>
          <span className="text-sm">{label}</span>
          <Button
            type="button"
            variant="outline"
            disabled={logoutMutation.isPending}
            onClick={() => logoutMutation.mutate()}
          >
            Выйти
          </Button>
        </>
      ) : null}
      {authStore.status === 'anonymous' ? (
        <Link to="/login" className={buttonVariants({ variant: 'outline' })}>
          Войти
        </Link>
      ) : null}
    </header>
  );
});
