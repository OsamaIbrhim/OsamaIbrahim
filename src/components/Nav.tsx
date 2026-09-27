import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { AnimatePresence, m } from 'motion/react';
import { Rocket, Sailboat, SquareTerminal } from 'lucide-react';
import { PROFILE } from '../data/profile';
import { pad2, useLedger } from '../lib/ledger';
import { useIntro } from '../lib/intro';
import { lockScroll, scrollToId } from '../lib/scroll';
import { openTerminal } from './Terminal';
import { revealTheme } from '../lib/themeReveal';

type Theme = 'dark' | 'light';

/**
 * The theme itself is set before first paint by the script in index.html
 * (saved choice, else the system preference). The page is prerendered, so the
 * first render can't know it: state starts as 'dark' everywhere and syncs from
 * the document after hydration. The toggle's icon is chosen in CSS, so it is
 * right from the first frame either way.
 */
function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  }, []);
  const current = useRef(theme);
  current.current = theme;
  useEffect(() => {
    // The new theme ripples out from the toggle button (the terminal's `theme`
    // command uses the same button as its origin).
    const toggle = () => {
      const next: Theme = current.current === 'dark' ? 'light' : 'dark';
      const button = document.querySelector<HTMLElement>('[data-theme-toggle]');
      const box = button?.getBoundingClientRect();
      const origin = box && box.width ? { x: box.left + box.width / 2, y: box.top + box.height / 2 } : undefined;
      revealTheme(() => {
        try {
          localStorage.setItem('theme', next);
        } catch {
          /* storage unavailable */
        }
        current.current = next;
        document.documentElement.dataset.theme = next;
        flushSync(() => setTheme(next));
      }, origin);
    };
    window.addEventListener('theme:toggle', toggle);
    return () => window.removeEventListener('theme:toggle', toggle);
  }, []);
  return { theme, toggle: () => window.dispatchEvent(new Event('theme:toggle')) };
}

function ChainPill() {
  const { available, ready, blocks, brokenAt, remining, forked } = useLedger();
  if (!available) return null;
  const sealed = blocks.filter((b) => b.status === 'valid').length;

  let text = `${sealed}/${blocks.length} mining`;
  let color = 'var(--warn)';
  let target = 'home';
  if (remining !== null) {
    text = `re-mining #${pad2(remining)}`;
  } else if (brokenAt !== null) {
    text = `broken at #${pad2(brokenAt)}`;
    color = 'var(--danger)';
    target = blocks[brokenAt].id;
  } else if (ready) {
    text = forked ? 'valid · forked' : 'chain valid';
    color = forked ? 'var(--warn)' : 'var(--accent)';
  }

  return (
    <a
      href={`#${target}`}
      onClick={(e) => {
        e.preventDefault();
        scrollToId(target);
      }}
      title="Live status of this page's chain"
      className="hidden items-center gap-2 rounded-full border border-line-strong px-3 py-1.5 font-mono text-[11px] text-text transition-colors hover:border-text sm:inline-flex"
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${ready && brokenAt === null && remining === null ? '' : 'pulse-dot'}`}
        style={{ background: color }}
      />
      <span className="tabular">{text}</span>
    </a>
  );
}

export default function Nav() {
  const { blocks } = useLedger();
  const { theme, toggle } = useTheme();
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const links = [
    ...blocks.slice(1).map((b) => ({ id: b.id, nav: b.nav, index: b.index })),
    { id: 'contact', nav: 'Contact', index: blocks.length },
  ];

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  // Deep links (/#projects) land on their section once the intro has lifted.
  const { done } = useIntro();
  useEffect(() => {
    if (!done) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id && document.getElementById(id)) setTimeout(() => scrollToId(id), 150);
  }, [done]);

  useEffect(() => {
    lockScroll(menu);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menu]);

  const jump = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    if (menu) {
      // Unlock scrolling first, then move: a scroll issued while locked is dropped.
      setMenu(false);
      lockScroll(false);
      setTimeout(() => scrollToId(id), 60);
    } else scrollToId(id);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300 ${
          scrolled || menu ? 'border-b border-line bg-bg/85 backdrop-blur-md' : 'border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-6 px-4 sm:px-6 lg:px-10">
          <a href="#home" onClick={jump('home')} className="flex items-center gap-2.5" aria-label="Osama Ibrahim, back to top">
            <span aria-hidden className="grid h-8 w-8 place-items-center rounded-full border border-line-strong font-serif text-[15px] italic">
              oi
            </span>
            <span className="hidden text-sm font-medium md:inline">{PROFILE.name}</span>
          </a>

          <nav aria-label="Sections" className="ml-auto hidden xl:block">
            <ul className="flex items-center gap-6">
              {links.map((l) => (
                <li key={l.id}>
                  <a
                    href={`#${l.id}`}
                    onClick={jump(l.id)}
                    className="group text-[13px] text-muted transition-colors hover:text-text"
                  >
                    <span className="mr-1 font-mono text-[10px] text-faint group-hover:text-accent">#{pad2(l.index)}</span>
                    {l.nav}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2 xl:ml-4">
            <ChainPill />
            <button
              type="button"
              onClick={openTerminal}
              aria-label="Open terminal (backtick key)"
              title="Terminal  `"
              className="grid h-9 w-9 place-items-center rounded-full border border-line-strong text-muted transition-colors hover:border-text hover:text-text"
            >
              <SquareTerminal className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={toggle}
              data-theme-toggle
              aria-label={theme === 'dark' ? 'Sail back to the sea (light theme)' : 'Launch into space (dark theme)'}
              className="grid h-9 w-9 place-items-center rounded-full border border-line-strong text-muted transition-colors hover:border-text hover:text-text"
            >
              <Rocket className="theme-icon-light h-4 w-4" />
              <Sailboat className="theme-icon-dark h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setMenu((m) => !m)}
              aria-expanded={menu}
              aria-controls="mobile-menu"
              className="inline-flex h-9 items-center rounded-full border border-line-strong px-4 text-[13px] xl:hidden"
            >
              {menu ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menu && (
          <m.nav
            id="mobile-menu"
            aria-label="Sections"
            data-lenis-prevent
            className="fixed inset-0 z-40 overflow-y-auto bg-bg px-4 pt-24 sm:px-6 xl:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul className="border-t border-line">
              {links.map((l, i) => (
                <m.li
                  key={l.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + 0.05 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="border-b border-line"
                >
                  <a href={`#${l.id}`} onClick={jump(l.id)} className="flex items-baseline gap-4 py-4">
                    <span className="font-mono text-[11px] text-faint">#{pad2(l.index)}</span>
                    <span className="display text-5xl">{l.nav}</span>
                  </a>
                </m.li>
              ))}
            </ul>
            <a href={PROFILE.resume} target="_blank" rel="noreferrer" className="mt-8 inline-block font-mono text-sm text-accent">
              Résumé ↗
            </a>
          </m.nav>
        )}
      </AnimatePresence>
    </>
  );
}
