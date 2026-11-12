import { useState } from 'react';

import { useNavigate } from 'react-router';

import { meetingIdFromLink } from '@shared/lib/meeting-link';
import { Button } from '@shared/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/ui/Card';
import { Input } from '@shared/ui/Input';

export const JoinByLink = () => {
  const navigate = useNavigate();
  const [link, setLink] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const meetingId = meetingIdFromLink(link);

    if (!meetingId) {
      setError('Вставьте ссылку на встречу');
      return;
    }

    setError(null);
    navigate(`/m/${meetingId}`);
  };

  return (
    <section className="pt-16 sm:pt-24">
      <div className="mx-auto w-full max-w-lg min-w-0">
        <p className="font-heading text-muted-foreground mb-3 text-center text-xs tracking-[0.2em] uppercase">
          Встреча
        </p>
        <h2 className="mb-8 text-center text-2xl leading-tight font-medium sm:text-4xl">
          Войти по ссылке
        </h2>

        <Card>
          <CardHeader>
            <CardTitle>Ссылка на встречу</CardTitle>
            <CardDescription>
              Вставьте ссылку, которую вам отправили. Аккаунт для входа не нужен.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-3" onSubmit={onSubmit}>
              <Input
                type="text"
                name="meeting-link"
                value={link}
                placeholder="https://example.com/m/…"
                aria-label="Ссылка на встречу"
                className="h-10"
                onChange={(event) => {
                  setLink(event.target.value);
                  setError(null);
                }}
              />
              {error ? <p className="text-sm text-red-300">{error}</p> : null}
              <Button type="submit" className="h-10 w-fit">
                Войти
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
