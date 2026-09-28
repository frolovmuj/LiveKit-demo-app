import type { FC } from 'react';

import { AuroraBlock } from '@widgets/AuroraBlock';
import { P2PBlock } from '@widgets/P2PBlock';

export const HomePage: FC = () => {
  return (
    <main className="bg-background min-h-svh p-4 sm:p-10">
      <AuroraBlock />
      <P2PBlock />
    </main>
  );
};
