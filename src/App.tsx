import { Suspense, useEffect, type ComponentType } from 'react';
import { LazyMotion, MotionConfig } from 'motion/react';
import Nav from './components/Nav';
import Hero from './components/Hero';
import About from './components/About';
import Marquee from './components/Marquee';
import Stack from './components/Stack';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Education from './components/Education';
import Contact from './components/Contact';
import TamperToast from './components/TamperToast';
import Terminal from './components/Terminal';
import Preloader from './components/Preloader';
import MotionDirector from './components/MotionDirector';
import Cursor from './components/Cursor';
import { PROFILE } from './data/profile';
import { IntroProvider } from './lib/intro';
import { LedgerProvider, shortHash, useLedger } from './lib/ledger';
import { expectIslands, islandHydrated } from './lib/hydration';

// Motion's animation features load after first paint (see src/lib/motionFeatures.ts).
const motionFeatures = () => import('./lib/motionFeatures').then((m) => m.default);

/**
 * A hydration boundary. The page arrives prerendered, and React hydrates each
 * boundary as its own chunk of work, yielding to the browser in between,
 * instead of one long task for the whole page. Nothing here suspends, so the
 * fallback never shows.
 */
function Island({ id, of: Section }: { id: string; of: ComponentType }) {
  return (
    <Suspense fallback={null}>
      <Section />
      <Hydrated id={id} />
    </Suspense>
  );
}
function Hydrated({ id }: { id: string }) {
  useEffect(() => islandHydrated(id), [id]);
  return null;
}

function Footer() {
  const { head, blocks, ready } = useLedger();
  return (
    <footer className="relative overflow-hidden border-t border-line">
      <div className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 font-mono text-[11px] text-muted sm:flex-row sm:items-end sm:justify-between">
          <div>
            chain height {blocks.length} · head {ready ? shortHash(head, 10, 6) : 'mining…'} · press ` for a terminal
            <br />
            built with React, TypeScript, GSAP, three.js, Web Crypto SHA-256, and a lot of tea.
          </div>
          <div className="sm:text-right">
            <span suppressHydrationWarning>©&nbsp;{new Date().getFullYear()}</span> {PROFILE.name}
            <br />
            <span lang="ar" dir="rtl" className="font-arabic text-[17px] font-bold text-accent">
              {PROFILE.nameAr}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Everything below the hero hydrates as separate chunks (see Island).
const MAIN: Array<[string, ComponentType]> = [
  ['about', About],
  ['marquee', Marquee],
  ['stack', Stack],
  ['experience', Experience],
  ['projects', Projects],
  ['education', Education],
  ['contact', Contact],
];
const AFTER: Array<[string, ComponentType]> = [
  ['footer', Footer],
  ['toast', TamperToast],
  ['terminal', Terminal],
];
expectIslands([...MAIN, ...AFTER].map(([id]) => id));

export default function App() {
  return (
    <LazyMotion features={motionFeatures} strict>
      <MotionConfig reducedMotion="user">
        <IntroProvider>
          <LedgerProvider>
            <a
              href="#about"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[95] focus:rounded-full focus:bg-text focus:px-4 focus:py-2 focus:text-bg"
            >
              Skip to content
            </a>
            <Preloader />
            <MotionDirector />
            <Cursor />
            <Nav />
            <main className="w-full max-w-full overflow-x-clip">
              <Hero />
              {MAIN.map(([id, Section]) => (
                <Island key={id} id={id} of={Section} />
              ))}
            </main>
            {AFTER.map(([id, Section]) => (
              <Island key={id} id={id} of={Section} />
            ))}
          </LedgerProvider>
        </IntroProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
