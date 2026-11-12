import { useState } from 'react';

import { useNavigate } from 'react-router';

import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { ApiError } from '@shared/api/client';
import { useRegisterMutation } from '@shared/auth/auth-queries';
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

type SignupFormProps = {
  setIsLogin: (isLogin: boolean) => void;
};

const formSchema = z.object({
  name: z.string().min(1, { message: 'Введите имя' }),
  email: z.email({
    message: 'Введите корректный адрес электронной почты',
  }),
  password: z
    .string()
    .min(8, { message: 'Пароль должен быть не менее 8 символов' })
    .max(20, { message: 'Пароль должен быть не длиннее 20 символов' }),
});

type FormSchema = z.infer<typeof formSchema>;

export function SignupForm({
  setIsLogin,
  ...props
}: React.ComponentProps<typeof Card> & SignupFormProps) {
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();
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
      await registerMutation.mutateAsync(data);
      navigate('/');
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : 'Не удалось создать аккаунт',
      );
    }
  };

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...register('name')}
              />
              {errors.name ? (
                <p className="text-sm text-red-300">{errors.name.message}</p>
              ) : null}
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register('email')}
              />
              {errors.email ? (
                <p className="text-sm text-red-300">{errors.email.message}</p>
              ) : null}
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" type="password" {...register('password')} />
              {errors.password ? (
                <p className="text-sm text-red-300">{errors.password.message}</p>
              ) : (
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              )}
            </Field>
            {formError ? <p className="text-sm text-red-300">{formError}</p> : null}
            <Field>
              <Button type="submit" disabled={isSubmitting}>
                Create Account
              </Button>
              <GithubAuthLink label="Sign in with GitHub" />
              <FieldDescription className="px-6 text-center">
                Already have an account?{' '}
                <button type="button" onClick={() => setIsLogin(true)}>
                  Sign in
                </button>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
