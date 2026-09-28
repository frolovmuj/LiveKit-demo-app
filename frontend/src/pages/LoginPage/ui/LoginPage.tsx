import { type FC, useState } from 'react';

import { LoginForm } from '@shared/ui/LoginForm';
import { SignupForm } from '@shared/ui/SignupForm';

export const LoginPage: FC = () => {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {isLogin ? (
          <LoginForm setIsLogin={setIsLogin} />
        ) : (
          <SignupForm setIsLogin={setIsLogin} />
        )}
      </div>
    </div>
  );
};
