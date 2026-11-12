import { useEffect, useRef, useState } from 'react';

import { Link, useParams } from 'react-router';

import { useMutation } from '@tanstack/react-query';
import { observer } from 'mobx-react-lite';

import {
  type MeetingJoinFailure,
  issueMeetingToken,
  meetingJoinFailure,
} from '@shared/api/meetings';
import { authStore } from '@shared/auth/auth-store';
import { Button, buttonVariants } from '@shared/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/ui/Card';
import { Input } from '@shared/ui/Input';

const failureCopy: Record<
  Exclude<MeetingJoinFailure, 'name'>,
  { title: string; message: string }
> = {
  not_found: {
    title: 'Встреча не найдена',
    message: 'Ссылка недействительна или срок встречи истёк.',
  },
  full: {
    title: 'Встреча заполнена',
    message: 'Уже восемь участников. Войти нельзя.',
  },
  other: {
    title: 'Не удалось войти',
    message: 'Попробуйте ещё раз чуть позже.',
  },
};

export const MeetingPage = observer(() => {
  const { id = '' } = useParams();
  const [displayName, setDisplayName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const requestedId = useRef<string | null>(null);
  const tokenMutation = useMutation({
    mutationFn: (input: { meetingId: string; displayName?: string }) =>
      issueMeetingToken(input.meetingId, input.displayName),
  });

  useEffect(() => {
    if (authStore.status !== 'authenticated' || !id || requestedId.current === id) {
      return;
    }

    requestedId.current = id;
    tokenMutation.mutate({ meetingId: id });
  }, [authStore.status, id]);

  const sameMeeting = tokenMutation.variables?.meetingId === id;
  const failure =
    sameMeeting && tokenMutation.isError
      ? meetingJoinFailure(tokenMutation.error)
      : null;

  const requestToken = (name?: string) => {
    if (!id) {
      return;
    }

    tokenMutation.mutate({ meetingId: id, displayName: name });
  };

  if (!id) {
    return (
      <MeetingNotice
        title={failureCopy.not_found.title}
        message={failureCopy.not_found.message}
      />
    );
  }

  if (authStore.status === 'loading' || (sameMeeting && tokenMutation.isPending)) {
    return (
      <MeetingNotice
        title="Встреча"
        message={
          authStore.status === 'loading'
            ? 'Проверяем сессию…'
            : 'Получаем доступ к встрече…'
        }
      />
    );
  }

  if (sameMeeting && tokenMutation.isSuccess) {
    return <MeetingNotice title="Встреча" message="Токен получен." />;
  }

  if (authStore.status === 'authenticated' && !failure) {
    return <MeetingNotice title="Встреча" message="Получаем доступ к встрече…" />;
  }

  if (failure && (failure !== 'name' || authStore.status === 'authenticated')) {
    const copy = failure === 'name' ? failureCopy.other : failureCopy[failure];

    return (
      <MeetingNotice title={copy.title} message={copy.message}>
        {failure === 'other' ? (
          <Button
            type="button"
            onClick={() =>
              requestToken(
                authStore.status === 'authenticated'
                  ? undefined
                  : displayName.trim() || undefined,
              )
            }
          >
            Попробовать снова
          </Button>
        ) : null}
        <Link to="/" className={buttonVariants({ variant: 'outline' })}>
          На главную
        </Link>
      </MeetingNotice>
    );
  }

  const onSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = displayName.trim();

    if (name.length < 1 || name.length > 40) {
      setNameError('Введите имя от 1 до 40 символов');
      return;
    }

    setNameError(null);
    requestToken(name);
  };

  return (
    <MeetingFrame>
      <CardHeader>
        <CardTitle>Как вас представить</CardTitle>
        <CardDescription>Имя увидят остальные участники встречи.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-3" onSubmit={onSubmit}>
          <Input
            type="text"
            name="display-name"
            value={displayName}
            autoComplete="nickname"
            placeholder="Имя"
            aria-label="Имя"
            className="h-10"
            onChange={(event) => {
              setDisplayName(event.target.value);
              setNameError(null);
            }}
          />
          {nameError || failure === 'name' ? (
            <p className="text-sm text-red-300">
              {nameError ?? 'Введите имя от 1 до 40 символов'}
            </p>
          ) : null}
          <Button type="submit" className="h-10 w-fit">
            Войти
          </Button>
        </form>
      </CardContent>
    </MeetingFrame>
  );
});

function MeetingNotice({
  title,
  message,
  children,
}: {
  title: string;
  message: string;
  children?: React.ReactNode;
}) {
  return (
    <MeetingFrame>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      {children ? (
        <CardContent className="flex flex-wrap gap-3">{children}</CardContent>
      ) : null}
    </MeetingFrame>
  );
}

function MeetingFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex w-full items-center justify-center p-6 md:p-10">
      <Card className="w-full max-w-md">{children}</Card>
    </main>
  );
}
