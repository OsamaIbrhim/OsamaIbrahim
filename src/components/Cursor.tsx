import { useEffect, useRef, useState } from 'react';

/**
 * A dot that tracks the pointer exactly and a ring that follows with lag.
 * The ring grows over anything clickable, shows a label over [data-cursor],
 * and hides over text fields so the native caret stays in charge.
 * Elements with [data-magnetic] lean toward the pointer.
 * Mouse and trackpad only; touch devices keep their native behaviour.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState('');

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!enabled || !dot.current || !ring.current) return;
    // GSAP loads on demand (mouse devices only), outside the main bundle.
    let off = () => {};
    let cancelled = false;
    import('gsap').then(({ default: gsap }) => {
      if (cancelled || !dot.current || !ring.current) return;
      off = follow(gsap);
    });
    return () => {
      cancelled = true;
      off();
    };
  }, [enabled]);

  /** Wires the pointer to the dot, the ring and magnetic elements; returns the teardown. */
  function follow(gsap: typeof import('gsap').default) {
    document.documentElement.classList.add('has-cursor');

    const dx = gsap.quickTo(dot.current!, 'x', { duration: 0.08, ease: 'power3' });
    const dy = gsap.quickTo(dot.current!, 'y', { duration: 0.08, ease: 'power3' });
    const rx = gsap.quickTo(ring.current!, 'x', { duration: 0.45, ease: 'power3' });
    const ry = gsap.quickTo(ring.current!, 'y', { duration: 0.45, ease: 'power3' });

    let magnet: HTMLElement | null = null;

    const onMove = (e: PointerEvent) => {
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);

      const t = e.target as HTMLElement;
      const text = t.closest('input, textarea, [contenteditable="true"], [contenteditable="plaintext-only"]');
      const labelled = t.closest<HTMLElement>('[data-cursor]');
      const clickable = t.closest('a, button, [role="button"], summary, label');
      const state = text ? 'text' : labelled ? 'label' : clickable ? 'hover' : 'idle';
      ring.current!.dataset.state = state;
      dot.current!.dataset.state = state;
      setLabel(labelled?.dataset.cursor ?? '');

      const m = t.closest<HTMLElement>('[data-magnetic]');
      if (m !== magnet && magnet) gsap.to(magnet, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      magnet = m;
      if (m) {
        const r = m.getBoundingClientRect();
        gsap.to(m, {
          x: (e.clientX - (r.left + r.width / 2)) * 0.25,
          y: (e.clientY - (r.top + r.height / 2)) * 0.35,
          duration: 0.4,
          ease: 'power3.out',
        });
      }
    };
    const onLeave = () => {
      ring.current!.dataset.state = 'gone';
      dot.current!.dataset.state = 'gone';
    };
    const onDown = () => ring.current!.classList.add('is-down');
    const onUp = () => ring.current!.classList.remove('is-down');

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }

  if (!enabled) return null;
  return (
    <>
      <div ref={ring} aria-hidden className="cursor-ring" data-state="gone">
        <span className="cursor-label">{label}</span>
      </div>
      <div ref={dot} aria-hidden className="cursor-dot" data-state="gone" />
    </>
  );
}
