import { useEffect, useState } from 'react';
import { ArrowDownRight, GraduationCap } from 'lucide-react';
import BlockFrame from './BlockFrame';
import Claim from './Claim';
import Reveal from './Reveal';
import { DEGREE } from '../data/profile';
import { projects } from '../data/projects';
import { hashingAvailable, sha256 } from '../lib/ledger';
import { scrollToId } from '../lib/scroll';

// The degree's fingerprint: SHA-256 of its canonical record, the same idea my
// graduation project uses to make academic credentials tamper-evident.
function useFingerprint(record: string) {
  const [print, setPrint] = useState('');
  useEffect(() => {
    if (!hashingAvailable) return;
    let alive = true;
    sha256(record).then((h) => alive && setPrint(h));
    return () => {
      alive = false;
    };
  }, [record]);
  return print;
}

export default function Education() {
  const print = useFingerprint(`${DEGREE.title}|${DEGREE.school}|${DEGREE.period}`);
  const graduation = projects.find((p) => p.id === 'not');

  return (
    <BlockFrame index={5}>
      <p className="eyebrow">Education</p>
      <Reveal>
        <h2 className="display mt-5 max-w-[22ch] text-[clamp(2.6rem,6vw,5.25rem)]">
          <Claim index={5} />
        </h2>
      </Reveal>

      <div className="mt-16 grid gap-6 lg:grid-cols-12">
        <Reveal className="lg:col-span-6">
          <article className="relative h-full overflow-hidden rounded-[4px] border border-line-strong bg-bg-2 p-7 sm:p-10">
            <GraduationCap className="h-6 w-6 text-accent" />
            <div className="mt-10 font-mono text-[11px] text-muted">{DEGREE.period}</div>
            <h3 className="display mt-2 text-[clamp(2.4rem,4vw,3.4rem)]">{DEGREE.title}</h3>
            <div className="mt-2 text-lg text-text">{DEGREE.school}</div>
            <div className="mt-12 border-t border-line pt-4 font-mono text-[10.5px] text-faint">
              fingerprint <span className="break-all text-muted">{print || '—'}</span>
            </div>
          </article>
        </Reveal>

        <div className="lg:col-span-6">
          <Reveal>
            <div className="border-t border-line py-6">
              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint">Core curriculum</div>
              <ul className="mt-4 flex flex-wrap gap-2">
                {DEGREE.focus.map((f) => (
                  <li key={f} className="rounded-full border border-line-strong px-3 py-1.5 text-sm text-text">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {graduation && (
            <Reveal delay={0.06}>
              <div className="border-y border-line py-6">
                <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint">Graduation project</div>
                <h4 className="display mt-3 text-4xl">{graduation.title}</h4>
                <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted">{graduation.description}</p>
                <button
                  type="button"
                  onClick={() => scrollToId('projects')}
                  className="link-underline mt-5 inline-flex items-center gap-1.5 text-sm text-text"
                >
                  See it in the projects <ArrowDownRight className="h-3.5 w-3.5 rotate-[-90deg]" />
                </button>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </BlockFrame>
  );
}
