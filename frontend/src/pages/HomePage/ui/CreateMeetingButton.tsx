import { useState } from 'react';

import { useNavigate } from 'react-router';

import { useMutation } from '@tanstack/react-query';
import { observer } from 'mobx-react-lite';

import { ApiError } from '@shared/api/client';
import { createMeeting } from '@shared/api/meetings';
import { authStore } from '@shared/auth/auth-store';
import { Button } from '@shared/ui/Button';

export const CreateMeetingButton = observer(() => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const createMutation = useMutation({ mutationFn: createMeeting });
  const waitingForSession = authStore.status === 'loading';

  const onClick = async () => {
    if (authStore.status !== 'authenticated') {
      navigate('/login');
      return;
    }

    setError(null);

    try {
      const meeting = await createMutation.mutateAsync();
      navigate(`/m/${meeting.id}`);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        navigate('/login');
        return;
      }

      setError(
        caught instanceof ApiError && caught.status === 429
          ? 'Слишком много встреч. Попробуйте позже.'
          : 'Не удалось создать встречу',
      );
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        type="button"
        size="lg"
        className="w-fit"
        disabled={waitingForSession || createMutation.isPending}
        onClick={() => {
          void onClick();
        }}
      >
        {createMutation.isPending ? 'Создаём…' : 'Создать встречу'}
      </Button>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
});
