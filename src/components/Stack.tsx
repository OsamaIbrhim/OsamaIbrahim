import BlockFrame from './BlockFrame';
import Claim from './Claim';
import Code from './Code';
import Reveal from './Reveal';
import { REGISTERS, TOOLKIT } from '../data/profile';

export default function Stack() {
  return (
    <BlockFrame index={2}>
      <p className="eyebrow">Stack</p>
      <div className="mt-5 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 data-split className="display text-[clamp(2.6rem,6vw,5.25rem)]">
            Three scripts,
            <br />
            <em>one decree.</em>
          </h2>
        </div>
        <Reveal className="text-[1.0625rem] leading-relaxed text-muted lg:col-span-5 lg:pt-4" delay={0.08}>
          <p>
            In 1799, near Rashid in the Nile Delta, a slab of stone turned up carrying the same decree in three scripts:
            hieroglyphic, Demotic and Greek. That's the Rosetta Stone. It's also how I think about software.
          </p>
          <p className="mt-4 font-serif text-[1.45rem] leading-snug text-text">
            <Claim index={2} />
          </p>
        </Reveal>
      </div>

      {/* The stone: three registers, one feature. */}
      <div className="mt-16 overflow-hidden rounded-[3px] border border-line-strong bg-bg-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3 font-mono text-[11px] text-muted">
          <span>decree: checkout(cart)</span>
          <span className="text-faint">illustrative, based on Nook's architecture</span>
        </div>
        {REGISTERS.map((r, i) => (
          <Reveal key={r.key} delay={i * 0.06}>
            <div
              className={`grid gap-6 px-5 py-8 sm:px-8 lg:grid-cols-12 lg:gap-10 ${i > 0 ? 'border-t border-dashed border-line-strong' : ''}`}
            >
              <div className="lg:col-span-4">
                <div className="font-mono text-[11px] text-faint">
                  REGISTER {['I', 'II', 'III'][i]} · {r.script.toUpperCase()}, {r.scriptNote}
                </div>
                <h3 className="display mt-3 text-5xl">{r.layer}</h3>
                <div className="mt-2 font-mono text-xs text-accent">{r.lang}</div>
                <ul className="mt-6 flex flex-wrap gap-1.5">
                  {r.skills.map((s) => (
                    <li key={s} className="rounded-full border border-line px-2.5 py-1 text-xs text-text">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="min-w-0 border-line lg:col-span-8 lg:border-l lg:pl-10">
                <Code source={r.code} />
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-baseline gap-x-6 gap-y-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint">Also in the toolbox</span>
        {TOOLKIT.map((t) => (
          <span key={t} className="text-sm text-muted">
            {t}
          </span>
        ))}
      </div>
    </BlockFrame>
  );
}
