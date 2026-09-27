import { useEffect } from 'react';
import { whenHydrated } from '../lib/hydration';
import shipUrl from '../assets/models/ship.glb?url';

/**
 * Starts the scroll-linked motion (smooth scrolling, heading reveals, word
 * scrubs, parallax, stacking cards; see src/lib/scrollMotion.ts) once the page
 * has painted, every section has hydrated (the effects rewrite text into lines
 * and words, which React must not find half-way), and the browser is idle. GSAP and Lenis are loaded then, in their
 * own chunk, so they never delay the first paint.
 */
export default function MotionDirector() {
  useEffect(() => {
    let stop: (() => void) | undefined;
    let cancelled = false;
    const start = () =>
      import('../lib/scrollMotion').then(({ startScrollMotion }) => {
        if (cancelled) return;
        stop = startScrollMotion();
        // The light-mode ship is only fetched when the sea is first shown. Warm
        // the cache now, while nothing else is loading, so switching to light
        // shows it at once instead of popping in.
        if (document.documentElement.dataset.theme !== 'light') {
          fetch(shipUrl, { priority: 'low' } as RequestInit).catch(() => {});
        }
      });
    const idle = () =>
      typeof requestIdleCallback === 'function' ? requestIdleCallback(start, { timeout: 1200 }) : setTimeout(start, 200);
    const afterLoad = () => {
      if (document.readyState === 'complete') idle();
      else window.addEventListener('load', idle, { once: true });
    };
    whenHydrated().then(() => !cancelled && afterLoad());
    return () => {
      cancelled = true;
      window.removeEventListener('load', idle);
      stop?.();
    };
  }, []);

  return null;
}
