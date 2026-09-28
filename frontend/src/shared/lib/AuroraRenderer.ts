type AuroraStop = readonly [number, number, number];

type AuroraOptions = {
  colorStops?: readonly [AuroraStop, AuroraStop, AuroraStop];
  glow?: AuroraStop;
};

const BUFFER_WIDTH = 160;
const BUFFER_HEIGHT = 90;

const DEFAULT_STOPS = [
  [0.471, 0.059, 0.125],
  [0.02, 0.012, 0.012],
  [0.353, 0.043, 0.094],
] as const satisfies readonly [AuroraStop, AuroraStop, AuroraStop];

const DEFAULT_GLOW: AuroraStop = [0.878, 0.137, 0.306];

const hash = (x: number, y: number) => {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const fade = (t: number) => t * t * (3 - 2 * t);

const valueNoise = (x: number, y: number) => {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = fade(x - ix);
  const fy = fade(y - iy);

  return lerp(
    lerp(hash(ix, iy), hash(ix + 1, iy), fx),
    lerp(hash(ix, iy + 1), hash(ix + 1, iy + 1), fx),
    fy,
  );
};

const mixStops = (
  stops: readonly [AuroraStop, AuroraStop, AuroraStop],
  x: number,
): AuroraStop => {
  if (x < 0.5) {
    const t = x / 0.5;
    return [
      lerp(stops[0][0], stops[1][0], t),
      lerp(stops[0][1], stops[1][1], t),
      lerp(stops[0][2], stops[1][2], t),
    ];
  }

  const t = (x - 0.5) / 0.5;
  return [
    lerp(stops[1][0], stops[2][0], t),
    lerp(stops[1][1], stops[2][1], t),
    lerp(stops[1][2], stops[2][2], t),
  ];
};

const paintFrame = (
  imageData: ImageData,
  time: number,
  mouse: { x: number; y: number },
  stops: readonly [AuroraStop, AuroraStop, AuroraStop],
  glow: AuroraStop,
) => {
  const { data, width, height } = imageData;

  for (let y = 0; y < height; y += 1) {
    const v = y / height;

    for (let x = 0; x < width; x += 1) {
      const u = x / width;
      const wave =
        Math.exp(valueNoise(u * 2 + time * 0.08, time * 0.22) * 0.5) * 0.5;
      const intensity = Math.max(0, 0.6 * (v * 3.4 - wave + 0.2));
      const alpha = Math.min(1, Math.max(0, (intensity - 0.08) / 0.45));

      const dx = u - mouse.x;
      const dy = v - mouse.y;
      const cursor = Math.max(0, 1 - Math.hypot(dx, dy) / 0.55);

      const ramp = mixStops(stops, u);
      const r = lerp(ramp[0] * intensity, glow[0], cursor * 0.28);
      const g = lerp(ramp[1] * intensity, glow[1], cursor * 0.28);
      const b = lerp(ramp[2] * intensity, glow[2], cursor * 0.28);

      const i = (y * width + x) * 4;
      data[i] = Math.round(r * 255);
      data[i + 1] = Math.round(g * 255);
      data[i + 2] = Math.round(b * 255);
      data[i + 3] = Math.round(Math.max(alpha, cursor * 0.45) * 255);
    }
  }
};

export const startAurora = (
  canvas: HTMLCanvasElement,
  options: AuroraOptions = {},
) => {
  const stops = options.colorStops ?? DEFAULT_STOPS;
  const glow = options.glow ?? DEFAULT_GLOW;
  const ctx = canvas.getContext('2d', { alpha: true });

  if (!ctx) {
    return () => undefined;
  }

  const buffer = document.createElement('canvas');
  buffer.width = BUFFER_WIDTH;
  buffer.height = BUFFER_HEIGHT;
  const bufferCtx = buffer.getContext('2d', { alpha: true });

  if (!bufferCtx) {
    return () => undefined;
  }

  const imageData = bufferCtx.createImageData(BUFFER_WIDTH, BUFFER_HEIGHT);
  const mouse = { x: 0.5, y: 0.65 };
  const targetMouse = { x: 0.5, y: 0.65 };
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  let frame = 0;
  let lastPaint = 0;
  let visible = true;
  let running = true;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const { clientWidth, clientHeight } = canvas;
    canvas.width = Math.max(1, Math.floor(clientWidth * dpr));
    canvas.height = Math.max(1, Math.floor(clientHeight * dpr));
  };

  const draw = (time: number) => {
    mouse.x += (targetMouse.x - mouse.x) * 0.08;
    mouse.y += (targetMouse.y - mouse.y) * 0.08;
    paintFrame(imageData, time, mouse, stops, glow);
    bufferCtx.putImageData(imageData, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(buffer, 0, 0, canvas.width, canvas.height);
  };

  const tick = (now: number) => {
    if (!running) {
      return;
    }

    if (visible && now - lastPaint >= 32) {
      lastPaint = now;
      draw(reducedMotion ? 0 : now * 0.001);
    }

    if (!reducedMotion) {
      frame = window.requestAnimationFrame(tick);
    }
  };

  const onMouseMove = (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return;
    }

    targetMouse.x = (event.clientX - rect.left) / rect.width;
    targetMouse.y = (event.clientY - rect.top) / rect.height;
  };

  const observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry?.isIntersecting ?? false;
    },
    { threshold: 0.05 },
  );

  const resizeObserver = new ResizeObserver(resize);
  resize();
  draw(0);
  resizeObserver.observe(canvas);
  observer.observe(canvas);
  window.addEventListener('mousemove', onMouseMove, { passive: true });
  frame = window.requestAnimationFrame(tick);

  return () => {
    running = false;
    window.cancelAnimationFrame(frame);
    observer.disconnect();
    resizeObserver.disconnect();
    window.removeEventListener('mousemove', onMouseMove);
  };
};
