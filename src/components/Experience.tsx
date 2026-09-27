import BlockFrame from './BlockFrame';
import Claim from './Claim';
import Reveal from './Reveal';
import { EXPERIENCE } from '../data/profile';

export default function Experience() {
  return (
    <BlockFrame index={3}>
      <p className="eyebrow">Experience</p>
      <Reveal>
        <h2 className="display mt-5 max-w-[20ch] text-[clamp(2.6rem,6vw,5.25rem)]">
          <Claim index={3} />
        </h2>
      </Reveal>

      <div className="mt-16 space-y-6">
        {EXPERIENCE.map((x, i) => (
          <Reveal key={x.company}>
            <article className="grid gap-8 border-t border-line pt-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <div className="font-mono text-[11px] text-faint">ROLE {String(i + 1).padStart(2, '0')}</div>
                <div className="mt-3 font-mono text-xs text-muted">
                  <span className="text-text">{x.company}</span>
                  <span className="mx-2 text-accent">→</span>
                  <span className="text-text">{x.product}</span>
                </div>
                <h3 data-split className="display mt-4 text-4xl">{x.role}</h3>
                <div className="mt-3 font-mono text-xs text-muted">
                  {x.kind} · {x.period} · {x.duration}
                </div>
                <div className="mt-2 font-mono text-[11px] text-accent">↳ {x.note}</div>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {x.stack.map((s) => (
                    <span key={s} className="rounded-full bg-accent-soft px-2.5 py-1 font-mono text-[11px] text-accent">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <ol className="lg:col-span-7 lg:col-start-6">
                {x.highlights.map((h, j) => (
                  <li
                    key={h}
                    className="grid grid-cols-[3rem_1fr] gap-2 border-b border-line py-4 text-[1.0625rem] leading-relaxed text-text"
                  >
                    <span className="pt-1 font-mono text-[11px] text-faint">{String(j + 1).padStart(2, '0')}</span>
                    {h}
                  </li>
                ))}
              </ol>
            </article>
          </Reveal>
        ))}
      </div>
    </BlockFrame>
  );
}
