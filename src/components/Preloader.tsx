import { useEffect, useState } from 'react';
import { useIntro } from '../lib/intro';
import { useLedger } from '../lib/ledger';

/**
 * A minimal loader: no curtain, nothing in the way. A hairline across the top
 * of the viewport tracks how many of the page's blocks have been mined, then
 * fades out once the chain is sealed. The hero starts as soon as the display
 * font is ready (or after a short cap), so the name decodes in the right face.
 */
export default function Preloader() {
  const { finish } = useIntro();
  const { progress, ready, available } = useLedger();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      finish();
    };
    document.fonts?.ready.then(go);
    const t = setTimeout(go, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready && available) return;
    const t = setTimeout(() => setHidden(true), 700);
    return () => clearTimeout(t);
  }, [ready, available]);

  const pct = available ? progress : 1;

  return (
    <div
      role="progressbar"
      aria-label="Mining this page's blocks"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct * 100)}
      className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-[2px] transition-opacity duration-700"
      style={{ opacity: hidden ? 0 : 1 }}
    >
      <div
        className="h-full bg-accent shadow-[0_0_12px_var(--accent)] transition-[width] duration-500 ease-out"
        style={{ width: `${Math.max(4, pct * 100)}%` }}
      />
    </div>
  );
}
