const WORDS = [
  'TypeScript',
  'Node.js',
  'React',
  'Next.js',
  'NestJS',
  'Express',
  'MongoDB',
  'PostgreSQL',
  'Electron',
  'Stripe',
  'GitHub Actions',
  'Tailwind CSS',
];

/** A slow, endless band of the tools I build with. Pauses on hover. */
export default function Marquee() {
  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {WORDS.map((w, i) => (
        <span key={w} className="flex items-center">
          <span className={`display px-6 text-[clamp(2.5rem,6vw,5.5rem)] ${i % 2 ? 'italic text-muted' : 'text-text'}`}>
            {w}
          </span>
          <span className="h-2 w-2 rotate-45 border border-accent" />
        </span>
      ))}
    </div>
  );

  return (
    <div className="marquee relative my-8 overflow-hidden border-y border-line py-6 sm:py-10" aria-label="Technologies I use">
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-24"
        style={{ background: 'linear-gradient(90deg, var(--bg), transparent)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-24"
        style={{ background: 'linear-gradient(270deg, var(--bg), transparent)' }}
      />
    </div>
  );
}
