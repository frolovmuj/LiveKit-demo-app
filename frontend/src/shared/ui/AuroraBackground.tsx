import { type FC, useEffect, useRef } from 'react';

import { cn } from 'cn';

import { startAurora } from '@shared/lib/AuroraRenderer';

type AuroraBackgroundProps = {
  className?: string;
};

export const AuroraBackground: FC<AuroraBackgroundProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    return startAurora(canvas);
  }, []);

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className,
      )}
    >
      <div className="animate-aurora-blob absolute -inset-[20%] bg-[radial-gradient(ellipse_at_20%_70%,rgba(224,35,78,0.55),transparent_55%),radial-gradient(ellipse_at_80%_45%,rgba(120,15,32,0.7),transparent_50%),radial-gradient(ellipse_at_50%_90%,rgba(90,11,24,0.8),transparent_45%)] blur-2xl motion-reduce:animate-none" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full scale-110 mix-blend-screen blur-xl"
      />
    </div>
  );
};
