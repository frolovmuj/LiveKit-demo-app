import type { FC } from 'react';

import { AuroraBlock } from '@widgets/AuroraBlock';

import { CreateMeetingButton } from './CreateMeetingButton';
import { JoinByLink } from './JoinByLink';

export const HomePage: FC = () => {
  return (
    <main className="bg-background min-h-svh p-4 sm:p-10">
      <AuroraBlock action={<CreateMeetingButton />} />
      <JoinByLink />
    </main>
  );
};
