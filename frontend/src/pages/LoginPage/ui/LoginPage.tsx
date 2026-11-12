import { type FC, useState } from 'react';

import { useSearchParams } from 'react-router';

import { githubErrorMessage } from '@shared/api/auth';
import { LoginForm } from '@shared/ui/LoginForm';
import { SignupForm } from '@shared/ui/SignupForm';

export const LoginPage: FC = () => {
  const [params] = useSearchParams();
  const githubError = githubErrorMessage(params.get('error'));
  const [isLogin, setIsLogin] = useState(Boolean(githubError));

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {githubError ? (
          <p className="mb-4 text-center text-sm text-red-300">{githubError}</p>
        ) : null}
        {isLogin ? (
          <LoginForm setIsLogin={setIsLogin} />
        ) : (
          <SignupForm setIsLogin={setIsLogin} />
        )}
      </div>
    </div>
  );
};
