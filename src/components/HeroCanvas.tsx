import { useEffect, useRef } from 'react';
import { useLedger } from '../lib/ledger';
import type { HeroScene, SceneInit, ScenePalette, SceneStatus } from '../lib/heroScene';
import { THEME_REVEAL_READY } from '../lib/themeReveal';

/**
 * Hosts the hero's 3D chain (see lib/heroScene.ts).
 *
 * Where the browser supports it, the canvas is handed to a Web Worker as an
 * OffscreenCanvas: three.js, shader compilation and every frame then run off
 * the main thread, so scrolling, typing and the chain's own mining never
 * stutter, even on modest GPUs. Otherwise the same scene runs here. Either
 * way it starts only once the browser is idle, and this component just feeds
 * it pointer position, theme colours, block statuses, size and visibility.
 */
function readPalette(): ScenePalette {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim() || '#ffffff';
  return {
    bg: v('--bg'),
    accent: v('--accent'),
    warn: v('--warn'),
    danger: v('--danger'),
    muted: v('--muted'),
    text: v('--text'),
    light: document.documentElement.dataset.theme === 'light',
  };
}

/** The scene's controls: implemented directly, or by messages to the worker. */
type Driver = Omit<HeroScene, never>;

export default function HeroCanvas() {
  const host = useRef<HTMLDivElement>(null);
  const { blocks } = useLedger();
  const statuses = useRef<SceneStatus[]>(blocks.map((b) => b.status));
  const driver = useRef<Driver | null>(null);

  useEffect(() => {
    statuses.current = blocks.map((b) => b.status);
    driver.current?.statuses(statuses.current);
  }, [blocks]);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    const teardown: Array<() => void> = [];
    const markReady = () => {
      if (!disposed) el.dataset.ready = 'true';
    };

    // Wire page events to whichever driver we ended up with.
    const attach = (d: Driver) => {
      driver.current = d;
      const ro = new ResizeObserver(() => d.resize(el.clientWidth, el.clientHeight, window.devicePixelRatio || 1));
      ro.observe(el);
      const onPointer = (e: PointerEvent) =>
        d.pointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
      window.addEventListener('pointermove', onPointer, { passive: true });
      // The worker draws straight to the screen, even while the browser holds
      // the page still to set up the theme ripple. So during a ripple, switch
      // worlds only once the ripple has started, or the new world flashes early.
      const mo = new MutationObserver(() => {
        const push = () => d.palette(readPalette());
        if ('themeReveal' in document.documentElement.dataset) window.addEventListener(THEME_REVEAL_READY, push, { once: true });
        else push();
      });
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      let onScreen = true;
      const sync = () => d.visible(onScreen && !document.hidden);
      const io = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      });
      io.observe(el);
      document.addEventListener('visibilitychange', sync);
      teardown.push(() => {
        ro.disconnect();
        mo.disconnect();
        io.disconnect();
        window.removeEventListener('pointermove', onPointer);
        document.removeEventListener('visibilitychange', sync);
        d.dispose();
        driver.current = null;
      });
    };

    // Fallback: the same scene on the main thread.
    const runHere = (canvas: HTMLCanvasElement, init: SceneInit) => {
      import('../lib/heroScene').then(({ createHeroScene }) => {
        if (disposed) return;
        const scene = createHeroScene(canvas, init, markReady);
        if (scene) attach(scene);
      });
    };

    const boot = () => {
      if (disposed) return;
      const canvas = document.createElement('canvas');
      canvas.style.cssText = 'width:100%;height:100%;display:block';
      el.appendChild(canvas);
      teardown.push(() => canvas.remove());

      const init: SceneInit = {
        width: el.clientWidth,
        height: el.clientHeight,
        dpr: window.devicePixelRatio || 1,
        reduce: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        mobile: window.matchMedia('(max-width: 767px)').matches,
        cores: navigator.hardwareConcurrency ?? 8,
        palette: readPalette(),
        statuses: statuses.current,
      };

      if (typeof canvas.transferControlToOffscreen !== 'function' || typeof Worker === 'undefined') {
        runHere(canvas, init);
        return;
      }

      let worker: Worker;
      try {
        worker = new Worker(new URL('../lib/hero.worker.ts', import.meta.url), { type: 'module' });
      } catch {
        runHere(canvas, init);
        return;
      }
      const offscreen = canvas.transferControlToOffscreen();
      worker.onmessage = (e: MessageEvent<{ type: string }>) => {
        if (e.data.type === 'ready') markReady();
      };
      worker.postMessage({ type: 'init', canvas: offscreen, init }, [offscreen]);
      const post = (msg: object) => worker.postMessage(msg);
      attach({
        resize: (width, height, dpr) => post({ type: 'resize', width, height, dpr }),
        pointer: (x, y) => post({ type: 'pointer', x, y }),
        statuses: (s) => post({ type: 'statuses', statuses: s }),
        palette: (p) => post({ type: 'palette', palette: p }),
        visible: (v) => post({ type: 'visible', visible: v }),
        dispose: () => {
          post({ type: 'dispose' });
          setTimeout(() => worker.terminate(), 200);
        },
      });
    };

    // Start only when the browser is idle: the first moments belong to the page.
    let cancelIdle: () => void;
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(boot, { timeout: 1200 });
      cancelIdle = () => window.cancelIdleCallback(id);
    } else {
      const id = window.setTimeout(boot, 300);
      cancelIdle = () => window.clearTimeout(id);
    }

    return () => {
      disposed = true;
      cancelIdle();
      teardown.splice(0).reverse().forEach((fn) => fn());
    };
  }, []);

  return (
    <div
      ref={host}
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-0 blur-2xl transition-[opacity,filter] duration-[1600ms] ease-out data-[ready=true]:opacity-100 data-[ready=true]:[filter:none]"
    />
  );
}
