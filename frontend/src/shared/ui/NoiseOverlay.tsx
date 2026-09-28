import type { FC } from 'react';

import { cn } from 'cn';

type NoiseOverlayProps = {
  className?: string;
};

const NOISE_DATA_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export const NoiseOverlay: FC<NoiseOverlayProps> = ({ className }) => {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-overlay',
        className,
      )}
      style={{ backgroundImage: NOISE_DATA_URI }}
    />
  );
};
