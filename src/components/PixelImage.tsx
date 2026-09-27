import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';

// Pixel sizes the image resolves through, coarse to sharp.
const STEPS = [48, 32, 20, 12, 7, 4, 2];
const STEP_MS = 85;

/**
 * An image that arrives pixelated and resolves to sharp. Until the file has
 * loaded it shows a soft blurred block; once it is loaded *and* on screen, a
 * canvas redraws it through ever-finer pixel grids, then hands over to the
 * real <img>. Reduced motion skips straight to the sharp image.
 *
 * The canvas reproduces `object-fit: cover`, so the effect lines up exactly
 * with the final image.
 */
export default function PixelImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  ...img
}: ImgHTMLAttributes<HTMLImageElement> & { src: string; imgClassName?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [phase, setPhase] = useState<'waiting' | 'resolving' | 'done'>('waiting');

  useEffect(() => {
    if (image.current?.complete && image.current.naturalWidth) setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded || phase !== 'waiting') return;
    const el = wrap.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('done');
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          setPhase('resolving');
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loaded, phase]);

  useEffect(() => {
    if (phase !== 'resolving') return;
    const c = canvas.current;
    const im = image.current;
    const box = wrap.current;
    if (!c || !im || !box) return;
    const ctx = c.getContext('2d');
    if (!ctx) {
      setPhase('done');
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = Math.max(1, Math.round(box.clientWidth * dpr));
    const H = Math.max(1, Math.round(box.clientHeight * dpr));
    c.width = W;
    c.height = H;

    // object-fit: cover source rectangle
    const scale = Math.max(W / im.naturalWidth, H / im.naturalHeight);
    const sw = W / scale;
    const sh = H / scale;
    const sx = (im.naturalWidth - sw) / 2;
    const sy = (im.naturalHeight - sh) / 2;

    const small = document.createElement('canvas');
    const sctx = small.getContext('2d')!;
    let i = 0;
    const draw = () => {
      const px = STEPS[i] * dpr;
      small.width = Math.max(1, Math.ceil(W / px));
      small.height = Math.max(1, Math.ceil(H / px));
      sctx.imageSmoothingEnabled = true;
      sctx.drawImage(im, sx, sy, sw, sh, 0, 0, small.width, small.height);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(small, 0, 0, small.width, small.height, 0, 0, W, H);
    };

    draw();
    const timer = setInterval(() => {
      i += 1;
      if (i >= STEPS.length) {
        clearInterval(timer);
        setPhase('done');
        return;
      }
      draw();
    }, STEP_MS);
    return () => clearInterval(timer);
  }, [phase]);

  return (
    <div ref={wrap} className={`relative overflow-hidden bg-bg-3 ${className}`}>
      <img
        ref={image}
        src={src}
        alt={alt}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`${imgClassName} transition-[opacity,filter] duration-500`}
        style={{ opacity: phase === 'done' ? 1 : 0 }}
        {...img}
      />
      {/* Before the file arrives: a soft, blurred glow instead of an empty box. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: loaded ? 0 : 1,
          background:
            'radial-gradient(60% 60% at 30% 35%, var(--accent-soft), transparent 70%), radial-gradient(50% 50% at 75% 70%, var(--line-strong), transparent 70%)',
          filter: 'blur(18px)',
        }}
      />
      <canvas
        ref={canvas}
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-300"
        style={{ opacity: phase === 'resolving' ? 1 : 0 }}
      />
    </div>
  );
}
