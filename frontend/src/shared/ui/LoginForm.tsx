import { useState } from 'react';

import { useNavigate } from 'react-router';

import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from 'cn';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { ApiError } from '@shared/api/client';
import { useLoginMutation } from '@shared/auth/auth-queries';
import { Button } from '@shared/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/ui/Card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@shared/ui/Field';
import { Input } from '@shared/ui/Input';

import { GithubAuthLink } from './GithubAuthLink';
import { Separator } from './Separator';

type LoginFormProps = {
  setIsLogin: (isLogin: boolean) => void;
};

const formSchema = z.object({
  email: z.email({
    message: 'Введите корректный адрес электронной почты',
  }),
  password: z
    .string()
    .min(8, {
      message: 'Пароль должен быть не менее 8 символов',
    })
    .refine((val) => /[^a-zA-Z0-9]/.test(val), {
      error: 'Пароль должен содержать спецсимвол',
    }),
});

type FormSchema = z.infer<typeof formSchema>;

export function LoginForm({
  setIsLogin,
  className,
  ...props
}: React.ComponentProps<'div'> & LoginFormProps) {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const onSubmit: SubmitHandler<FormSchema> = async (data) => {
    setFormError(null);

    try {
      await loginMutation.mutateAsync(data);
      navigate('/');
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Не удалось войти');
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" {...register('email')} required />
                {errors.email && (
                  <p className="text-sm text-red-300">{errors.email.message}</p>
                )}
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  required
                />
                {errors.password && (
                  <p className="text-sm text-red-300">{errors.password.message}</p>
                )}
              </Field>
              {formError ? (
                <p className="text-sm text-red-300">{formError}</p>
              ) : null}
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  Login
                </Button>
              </Field>
              <Separator />
              <Field>
                <GithubAuthLink label="Sign in with GitHub" />
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    className="underline underline-offset-4"
                    onClick={() => setIsLogin(false)}
                  >
                    Sign up
                  </button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
