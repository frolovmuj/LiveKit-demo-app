import { Phone } from 'lucide-react';

import { Button } from '@shared/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/ui/Card';
import { Input } from '@shared/ui/Input';

export const P2PBlock = () => {
  return (
    <section className="pt-16 sm:pt-24">
      <div className="mx-auto w-full min-w-0 max-w-lg">
        <p className="font-heading text-muted-foreground mb-3 text-center text-xs tracking-[0.2em] uppercase">
          Peer to peer
        </p>
        <h2 className="mb-8 text-center text-2xl leading-tight font-medium sm:text-4xl">
          Позвони напрямую
        </h2>

        <Card>
          <CardHeader>
            <CardTitle>P2P звонок</CardTitle>
            <CardDescription>
              Выберите пользователя, которому хотите позвонить напрямую.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-3 sm:flex-row sm:items-center"
              onSubmit={(event) => {
                event.preventDefault();
              }}
            >
              <Input
                type="email"
                name="peer"
                autoComplete="email"
                placeholder="example@example.com"
                aria-label="Email пользователя"
                className="h-10 min-w-0 flex-1"
              />
              <Button type="submit" className="h-10 shrink-0">
                <Phone />
                Позвонить
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
