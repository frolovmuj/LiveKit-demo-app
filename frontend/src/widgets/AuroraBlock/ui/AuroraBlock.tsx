import type { FC } from 'react';

import { Link } from 'react-router';

import { cn } from 'cn';

import { AuroraBackground } from '@shared/ui/AuroraBackground';
import { buttonVariants } from '@shared/ui/Button';
import { NoiseOverlay } from '@shared/ui/NoiseOverlay';

type AuroraBlockProps = {
  className?: string;
};

export const AuroraBlock: FC<AuroraBlockProps> = ({ className }) => {
  return (
    <section
      className={cn(
        'relative min-h-[420px] overflow-hidden rounded-2xl sm:min-h-[480px] sm:rounded-[32px] lg:min-h-[560px]',
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#050303] via-[#780f20] to-[#050303]" />
      <AuroraBackground />
      <NoiseOverlay />

      <div className="absolute inset-0 z-10 flex flex-col justify-center gap-8 p-6 text-white sm:gap-10 sm:p-10 lg:flex-row lg:items-end lg:justify-between lg:p-16">
        <h1 className="text-5xl leading-[1.1] font-medium sm:text-6xl md:text-7xl">
          Создай встречу.
          <br />
          Общайся без
          <br />
          ограничений.
        </h1>

        <div className="flex w-full max-w-md flex-col gap-6">
          <p className="text-sm leading-6 font-light opacity-70">
            Создай встречу и общайся с другими пользователями без ограничений.
          </p>
          <Link to="/login" className={cn(buttonVariants({ size: 'lg' }), 'w-fit')}>
            Начать встречу
          </Link>
        </div>
      </div>
    </section>
  );
};
