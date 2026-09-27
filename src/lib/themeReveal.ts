/**
 * Theme switch as a ripple: the new theme spreads out in a circle from the
 * toggle button until it covers the screen.
 *
 * Uses the View Transitions API: the old page is held as a snapshot while the
 * live new page is revealed through a growing clip-path circle. index.css keeps
 * the new view clipped to nothing until the animation starts, so it can't flash
 * in early. Without the API, or with reduced motion, the switch is instant.
 */

type ViewTransition = { ready: Promise<void>; finished: Promise<void> };
type DocWithVT = Document & { startViewTransition?: (update: () => void) => ViewTransition };

const DURATION = 600;
/** Fired once the ripple is running (or the switch gave up); the hero waits for it. */
export const THEME_REVEAL_READY = 'theme:reveal-ready';
const announce = () => window.dispatchEvent(new Event(THEME_REVEAL_READY));
let busy = false;

/** Runs `apply` (which must update the DOM synchronously) behind a circular reveal centred on `origin`. */
export function revealTheme(apply: () => void, origin?: { x: number; y: number }) {
  const doc = document as DocWithVT;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // A second click mid-ripple is dropped: applying it instantly would flash.
  if (busy) return;
  if (reduce || typeof doc.startViewTransition !== 'function') {
    apply();
    return;
  }
  busy = true;
  const x = origin?.x ?? innerWidth / 2;
  const y = origin?.y ?? innerHeight / 2;
  // Far enough to reach the farthest corner.
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const root = document.documentElement;
  root.style.setProperty('--reveal-x', `${x}px`);
  root.style.setProperty('--reveal-y', `${y}px`);
  root.dataset.themeReveal = '';

  const cleanup = () => {
    delete root.dataset.themeReveal;
    busy = false;
    announce();
  };

  let vt: ViewTransition;
  try {
    vt = doc.startViewTransition(apply);
  } catch {
    cleanup();
    apply();
    return;
  }
  vt.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: DURATION, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'forwards', pseudoElement: '::view-transition-new(root)' },
      );
      announce();
    })
    .catch(cleanup);
  vt.finished.then(cleanup, cleanup);
}
