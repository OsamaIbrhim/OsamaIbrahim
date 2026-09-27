import { useEffect, useState, type CSSProperties } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import BlockFrame from './BlockFrame';
import Claim from './Claim';
import HeroCanvas from './HeroCanvas';
import { openTerminal } from './Terminal';
import { PROFILE } from '../data/profile';
import { useLedger } from '../lib/ledger';
import { scrollToId } from '../lib/scroll';

/** Staggered entrance, run by CSS from the first paint (see .hero-in / .hero-rise in index.css). */
const delay = (s: number): CSSProperties => ({ animationDelay: `${s}s` });

function CairoClock() {
  // Unknown until the page is running in a browser (the HTML is prerendered);
  // a hidden placeholder of the same width keeps the line from shifting.
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit' });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const t = setInterval(tick, 15_000);
    return () => clearInterval(t);
  }, []);
  return <span className={`tabular ${time ? '' : 'invisible'}`}>{time ?? '00:00'}</span>;
}

/** A word that rises into view from behind its baseline. */
function Rise({ word, at, italic }: { word: string; at: number; italic?: boolean }) {
  return (
    <span className={`inline-block overflow-hidden pb-[0.1em] align-bottom ${italic ? 'italic' : ''}`}>
      <span className="hero-rise" style={delay(at)}>
        {word}
      </span>
    </span>
  );
}

export default function Hero() {
  const { ready, blocks, available } = useLedger();

  return (
    <div className="relative overflow-hidden">
      <HeroCanvas />
      {/* A soft wash so the type always reads over the 3D scene. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(120% 90% at 15% 95%, var(--bg) 25%, transparent 70%)' }}
      />

      <BlockFrame index={0} className="pt-24 sm:pt-28">
        <div data-hero-out className="flex min-h-[calc(100svh-15rem)] flex-col">
          <p className="hero-in eyebrow flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-accent">●</span>
            <span className="text-text">{PROFILE.role}</span>
            <span className="text-faint">/</span>
            <span>{PROFILE.discipline}</span>
            <span className="hidden text-faint sm:inline">/</span>
            <span className="hidden sm:inline">
              {PROFILE.location} · <CairoClock /> Cairo
            </span>
          </p>

          <div className="flex-1" />

          <h1 className="display mt-2 text-[clamp(4.5rem,11.5vw,11rem)] leading-[0.86] text-text">
            <span className="sr-only">{PROFILE.name}</span>
            <span aria-hidden className="block">
              <Rise word="Osama" at={0.05} />
            </span>
            <span aria-hidden className="flex flex-wrap items-end gap-x-6">
              <Rise word="Ibrahim" at={0.15} italic />
              <span
                lang="ar"
                dir="rtl"
                className="hero-in mb-[0.5em] hidden font-arabic text-[clamp(1.5rem,2.8vw,2.6rem)] font-bold leading-none tracking-normal text-accent sm:inline"
                style={delay(0.6)}
              >
                {PROFILE.nameAr}
              </span>
            </span>
          </h1>

          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="hero-in lg:col-span-7" style={delay(0.3)}>
              <p className="max-w-[40rem] font-serif text-[clamp(1.4rem,2.1vw,1.85rem)] leading-[1.2] text-text">
                <Claim index={0} />
              </p>
              <p className="mt-4 max-w-[36rem] font-mono text-[11.5px] leading-relaxed text-muted">
                {!available ? (
                  <>This page’s live chain needs a secure (HTTPS) connection.</>
                ) : ready ? (
                  <>
                    <span className="text-accent">✎</span> That sentence is sealed in block #00 with a real SHA-256
                    hash, and so is every section below. Change a word and watch the chain react, or{' '}
                    <button
                      type="button"
                      onClick={openTerminal}
                      className="text-text underline decoration-dotted underline-offset-4 hover:text-accent"
                    >
                      open the terminal
                    </button>
                    .
                  </>
                ) : (
                  <>
                    <span className="pulse-dot text-warn">⛏</span> Mining this page’s {blocks.length} blocks in your
                    browser…
                  </>
                )}
              </p>
            </div>

            <div className="hero-in flex flex-wrap items-center gap-3 lg:col-span-5 lg:justify-end" style={delay(0.4)}>
              <button
                type="button"
                data-magnetic
                onClick={() => scrollToId('projects')}
                className="group inline-flex items-center gap-2 rounded-full bg-text px-6 py-3.5 text-sm font-medium text-bg"
              >
                See the work
                <ArrowDownRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-[-45deg]" />
              </button>
              <button
                type="button"
                data-magnetic
                onClick={() => scrollToId('contact')}
                className="inline-flex items-center gap-2 rounded-full border border-line-strong px-6 py-3.5 text-sm font-medium text-text transition-colors hover:border-text"
              >
                Get in touch
              </button>
              <a
                href={PROFILE.resume}
                target="_blank"
                rel="noreferrer"
                className="link-underline ml-1 inline-flex items-center gap-1 text-sm text-muted hover:text-text"
              >
                Résumé <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </BlockFrame>
    </div>
  );
}
