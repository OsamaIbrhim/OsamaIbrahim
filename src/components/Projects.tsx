import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { AnimatePresence, m, useMotionValue, useSpring } from 'motion/react';
import { ArrowUpRight, Github, Plus } from 'lucide-react';
import BlockFrame from './BlockFrame';
import Claim from './Claim';
import Reveal from './Reveal';
import LimiterDemo from './LimiterDemo';
import ArchitectureDiagram from './ArchitectureDiagram';
import PixelImage from './PixelImage';
import { STATUS_LABEL, projects } from '../data/projects';
import type { Project, ProjectStatus } from '../types';

const CATEGORY: Record<Project['category'], string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  fullstack: 'Full-stack',
  web3: 'Web3',
  library: 'Library',
  automation: 'Automation',
};

const STATUS_COLOR: Record<ProjectStatus, string> = {
  live: 'var(--accent)',
  published: 'var(--accent)',
  'in-development': 'var(--warn)',
  'demo-soon': 'var(--muted)',
};

const hasUrl = (u?: string) => Boolean(u) && u !== '#';

function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    setFine(mq.matches);
    const on = (e: MediaQueryListEvent) => setFine(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return fine;
}

function StatusChip({ p }: { p: Project }) {
  const color = STATUS_COLOR[p.status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em]"
      style={{ color, borderColor: color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {STATUS_LABEL[p.status]}
    </span>
  );
}

function Links({ p }: { p: Project }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {hasUrl(p.liveUrl) && p.status === 'live' && (
        <a
          href={p.liveUrl}
          target="_blank"
          rel="noreferrer"
          data-magnetic
          className="inline-flex items-center gap-1.5 rounded-full bg-text px-4 py-2 text-sm font-medium text-bg"
        >
          Live site <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      )}
      {p.npmUrl && (
        <a
          href={p.npmUrl}
          target="_blank"
          rel="noreferrer"
          data-magnetic
          className="inline-flex items-center gap-1.5 rounded-full bg-text px-4 py-2 text-sm font-medium text-bg"
        >
          View on npm <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      )}
      {hasUrl(p.githubUrl) && (
        <a
          href={p.githubUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-4 py-2 text-sm text-text transition-colors hover:border-text"
        >
          <Github className="h-3.5 w-3.5" /> Source
        </a>
      )}
    </div>
  );
}

function Visual({ p }: { p: Project }) {
  if (p.visual === 'limiter') return <LimiterDemo install={p.install} />;
  if (p.visual === 'architecture') return <ArchitectureDiagram />;
  if (!p.image) return null;
  const body = (
    <div className="group relative overflow-hidden rounded-[3px] border border-line">
      <PixelImage
        src={p.image}
        alt={`${p.title} screenshot`}
        loading="lazy"
        className="aspect-[16/10] w-full"
        imgClassName="h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]"
      />
    </div>
  );
  return hasUrl(p.liveUrl) && p.status === 'live' ? (
    <a href={p.liveUrl} target="_blank" rel="noreferrer" data-cursor="Visit" aria-label={`Open ${p.title}`}>
      {body}
    </a>
  ) : (
    body
  );
}

/** A featured project: a full-width card that pins and recedes as the next one arrives. */
function FeaturedCard({ p, i, total }: { p: Project; i: number; total: number }) {
  const [more, setMore] = useState(false);
  const shown = more ? p.highlights : p.highlights.slice(0, 3);
  const noteColor = p.status === 'in-development' ? 'var(--warn)' : 'var(--accent)';

  // A card taller than the space below its sticky offset would hide its own
  // links behind the next card. Let tall cards stick higher (even above the
  // viewport top) so their bottom edge, with the buttons, always shows.
  const ref = useRef<HTMLElement>(null);
  const [top, setTop] = useState(88 + i * 14);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // The height comes from the ResizeObserver (measured during normal layout)
    // rather than offsetHeight, which would force a synchronous layout of the
    // whole page per card while it is still starting up.
    let height = 0;
    const calc = () => height && setTop(Math.min(88 + i * 14, window.innerHeight - height - 16));
    const ro = new ResizeObserver(([entry]) => {
      height = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
      calc();
    });
    ro.observe(el);
    window.addEventListener('resize', calc);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', calc);
    };
  }, [i]);

  return (
    <article ref={ref} className="stack-card md:sticky" style={{ top: `${top}px` }}>
      <div className="stack-card-inner origin-top rounded-[6px] border border-line-strong bg-bg-2 p-6 shadow-[0_-20px_60px_-30px_rgba(0,0,0,0.5)] sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-muted">
          <span>
            tx {String(i + 1).padStart(2, '0')} / {String(total).padStart(2, '0')} · {CATEGORY[p.category]}
          </span>
          <StatusChip p={p} />
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h3 className="display text-[clamp(2.75rem,6vw,5.5rem)]">{p.title}</h3>
            {p.note && (
              <p className="mt-3 font-mono text-[12px] leading-relaxed" style={{ color: noteColor }}>
                ↳ {p.note}
              </p>
            )}
            <p className="mt-6 text-[1.0625rem] leading-relaxed text-text">{p.description}</p>
            <ul className="mt-6 space-y-2.5">
              {shown.map((h) => (
                <li key={h} className="grid grid-cols-[1rem_1fr] gap-2 text-sm leading-relaxed text-muted">
                  <span className="text-accent">↳</span>
                  {h}
                </li>
              ))}
            </ul>
            {p.highlights.length > 3 && (
              <button
                type="button"
                onClick={() => setMore((m) => !m)}
                className="mt-3 font-mono text-[11px] text-text underline decoration-dotted underline-offset-4 hover:text-accent"
              >
                {more ? 'Show less' : `+ ${p.highlights.length - 3} more details`}
              </button>
            )}
            <div className="mt-8">
              <Links p={p} />
            </div>
          </div>
          <div className="lg:col-span-6">
            <Visual p={p} />
            <div className="mt-4 flex flex-wrap gap-1.5">
              {p.tags.map((t) => (
                <span key={t} className="rounded-full border border-line px-2.5 py-1 font-mono text-[10.5px] text-muted">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Projects() {
  const featured = projects.filter((p) => p.featured);
  const archive = projects.filter((p) => !p.featured);
  const [open, setOpen] = useState<string | null>(null);
  const [hovered, setHovered] = useState<Project | null>(null);
  const fine = useFinePointer();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 });
  const onMove = (e: MouseEvent) => {
    x.set(e.clientX + 24);
    y.set(e.clientY - 90);
  };

  return (
    <BlockFrame index={4}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Projects</p>
          <Reveal>
            <h2 className="display mt-5 max-w-[20ch] text-[clamp(2.6rem,6vw,5.25rem)]">
              <Claim index={4} />
            </h2>
          </Reveal>
        </div>
        <p className="font-mono text-[11px] text-faint">
          {projects.length} projects · {featured.length} featured
        </p>
      </div>

      <div className="mt-16 space-y-8 md:space-y-[18vh]">
        {featured.map((p, i) => (
          <FeaturedCard key={p.id} p={p} i={i} total={featured.length} />
        ))}
      </div>

      {/* Archive */}
      <div className="mt-28">
        <div className="flex items-baseline justify-between border-b border-line-strong pb-4">
          <h3 data-split className="display text-[clamp(2rem,4vw,3.25rem)]">
            The archive
          </h3>
          <span className="font-mono text-[11px] text-faint">earlier work</span>
        </div>

        <div onMouseMove={fine ? onMove : undefined}>
          {archive.map((p, i) => {
            const isOpen = open === p.id;
            return (
              <div key={p.id} className="border-b border-line">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`proj-${p.id}`}
                  onClick={() => setOpen(isOpen ? null : p.id)}
                  onMouseEnter={() => fine && !isOpen && setHovered(p)}
                  onMouseLeave={() => setHovered(null)}
                  className="group grid w-full grid-cols-[2.75rem_1fr_auto] items-center gap-3 py-6 text-left sm:grid-cols-[4rem_1fr_11rem_auto] sm:gap-6"
                >
                  <span className="font-mono text-[11px] text-faint">
                    {String(i + featured.length + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0">
                    <span className="display block text-[clamp(1.75rem,3.6vw,3rem)] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-2">
                      {p.title}
                    </span>
                    <span className="mt-1 block truncate font-mono text-[11px] text-muted">
                      {p.tags.slice(0, 4).join(' · ')}
                    </span>
                    {p.note && <span className="mt-1 block font-mono text-[11px] text-accent">↳ {p.note}</span>}
                  </span>
                  <span className="hidden font-mono text-[11px] text-muted sm:block">
                    {CATEGORY[p.category]}
                    <span className="mt-1 block" style={{ color: STATUS_COLOR[p.status] }}>
                      ● {STATUS_LABEL[p.status]}
                    </span>
                  </span>
                  <span
                    className="grid h-9 w-9 place-items-center rounded-full border border-line-strong transition-all duration-300 group-hover:border-text"
                    style={{ transform: isOpen ? 'rotate(45deg)' : undefined }}
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <m.div
                      id={`proj-${p.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="grid gap-8 pb-10 sm:pl-[5.5rem] lg:grid-cols-12">
                        <div className="lg:col-span-7">
                          <p className="text-[1.0625rem] leading-relaxed text-text">{p.longDescription}</p>
                          <ul className="mt-6 space-y-2.5">
                            {p.highlights.map((h) => (
                              <li key={h} className="grid grid-cols-[1rem_1fr] gap-2 text-sm leading-relaxed text-muted">
                                <span className="text-accent">↳</span>
                                {h}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-8">
                            <Links p={p} />
                          </div>
                        </div>
                        <div className="lg:col-span-5">
                          <Visual p={p} />
                        </div>
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cursor-following preview for closed archive rows (mouse users only). */}
      <AnimatePresence>
        {fine && hovered?.image && (
          <m.div
            key={hovered.id}
            aria-hidden
            className="pointer-events-none fixed left-0 top-0 z-40 w-[300px] overflow-hidden rounded-[3px] border border-line-strong bg-bg-2 shadow-2xl"
            style={{ x: sx, y: sy }}
            initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            <img src={hovered.image} alt="" className="aspect-[16/10] w-full object-cover" />
            <div className="px-3 py-2 font-mono text-[10.5px] text-muted">{hovered.description.slice(0, 90)}…</div>
          </m.div>
        )}
      </AnimatePresence>
    </BlockFrame>
  );
}
