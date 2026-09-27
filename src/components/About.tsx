import BlockFrame from './BlockFrame';
import Claim from './Claim';
import Reveal from './Reveal';
import { DEGREE, PROFILE } from '../data/profile';
import portrait from '../assets/images/osama.webp';

const FACTS = [
  ['Role', `${PROFILE.role}, ${PROFILE.discipline.toLowerCase()}`],
  ['Based in', `${PROFILE.location}, ${PROFILE.availability.toLowerCase()}`],
  ['Degree', `${DEGREE.title}, ${DEGREE.school} (${DEGREE.period})`],
  ['Experience', '8 months in production, full-stack MERN'],
  ['Languages', 'Arabic (native), English (professional)'],
  ['Open source', '@osamaibrahim/rate-limiter on npm'],
  ['Fuel', 'Tea. A lot of it. It is load-bearing.'],
];

export default function About() {
  return (
    <BlockFrame index={1}>
      <p className="eyebrow">About</p>
      <Reveal>
        <h2 className="display mt-5 max-w-[20ch] text-[clamp(2.6rem,6vw,5.25rem)]">
          <Claim index={1} />
        </h2>
      </Reveal>

      <div className="mt-20 grid gap-14 lg:grid-cols-12 lg:gap-10">
        <figure className="lg:col-span-5">
          <div data-scale-in className="relative overflow-hidden rounded-[4px]" data-cursor="Osama">
            <img
              src={portrait}
              alt="Portrait of Osama Ibrahim by the sea"
              width={600}
              height={720}
              loading="lazy"
              decoding="async"
              data-parallax="0.12"
              className="aspect-[5/6] w-full scale-[1.12] object-cover"
            />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-line" />
          </div>
          <figcaption className="mt-3 flex justify-between font-mono text-[11px] text-muted">
            <span>fig. 01 — by the Mediterranean</span>
            <span lang="ar" dir="rtl" className="font-arabic text-[17px] font-bold text-accent">
              {PROFILE.nameAr}
            </span>
          </figcaption>
        </figure>

        <div className="lg:col-span-6 lg:col-start-7">
          <div className="space-y-6 text-[clamp(1.1rem,1.5vw,1.35rem)] leading-relaxed text-text">
            <p data-scrub-words>
              I’m a software engineer and full-stack developer with a Computer Science &amp; Pure Mathematics degree and 8 months in
              production, where I built features for a CRM on the MERN stack: MongoDB schemas, Express APIs, React
              interfaces, all the way down.
            </p>
            <p data-scrub-words>
              What I care about is software that stays correct when things go wrong: prices calculated on the server
              instead of trusted from the browser, payments that are safe to receive twice, APIs that hold up when
              traffic spikes, a point of sale that keeps selling when the internet drops.
            </p>
            <p data-scrub-words>I learn fast, mostly on my own, and I like leaving a codebase clearer than I found it.</p>
          </div>

          <dl className="mt-14 border-t border-line">
            {FACTS.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-line py-4 text-sm">
                <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint">{k}</dt>
                <dd className="text-text">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </BlockFrame>
  );
}
