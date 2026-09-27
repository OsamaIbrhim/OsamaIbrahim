import { useEffect, useRef, useState } from 'react';
import { Copy, Check } from 'lucide-react';

const LIMIT = 5;
const WINDOW_MS = 4000;

interface Entry {
  n: number;
  at: number;
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

/**
 * A live, in-browser sliding-window limiter with the same semantics as
 * @osamaibrahim/rate-limiter's default algorithm: no more than LIMIT requests
 * in any WINDOW_MS span, measured continuously rather than per fixed bucket.
 */
export default function LimiterDemo({ install }: { install?: string }) {
  const hits = useRef<number[]>([]);
  const counter = useRef(0);
  const [log, setLog] = useState<Entry[]>([]);
  const [now, setNow] = useState(() => performance.now());
  const [copied, setCopied] = useState(false);

  const live = hits.current.filter((t) => now - t < WINDOW_MS);
  const active = live.length > 0;

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(performance.now()), 50);
    return () => clearInterval(t);
  }, [active]);

  const consume = () => {
    const t = performance.now();
    hits.current = hits.current.filter((h) => t - h < WINDOW_MS);
    const allowed = hits.current.length < LIMIT;
    if (allowed) hits.current.push(t);
    const retryAfterMs = allowed ? 0 : Math.ceil(WINDOW_MS - (t - hits.current[0]));
    counter.current += 1;
    setNow(t);
    setLog((l) =>
      [
        { n: counter.current, at: t, allowed, remaining: LIMIT - hits.current.length, retryAfterMs },
        ...l,
      ].slice(0, 5),
    );
  };

  const copy = async () => {
    if (!install) return;
    try {
      await navigator.clipboard.writeText(install);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="overflow-hidden rounded-[3px] border border-line-strong bg-bg-2">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5 font-mono text-[10.5px] text-muted">
        <span>live · sliding window · {LIMIT} req / {WINDOW_MS / 1000}s</span>
        <span className="text-faint">runs in your browser</span>
      </div>

      <div className="p-4">
        {/* Window slots: each fills on an allowed request and drains as it ages out. */}
        <div className="grid grid-cols-5 gap-1.5" aria-hidden>
          {Array.from({ length: LIMIT }, (_, i) => {
            const t = live[i];
            const left = t === undefined ? 0 : 1 - (now - t) / WINDOW_MS;
            return (
              <div key={i} className="relative h-10 overflow-hidden rounded-[2px] border border-line">
                <div
                  className="absolute inset-y-0 left-0 bg-accent/80"
                  style={{ width: `${Math.max(0, left) * 100}%` }}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={consume}
            className="rounded-full bg-text px-4 py-2 font-mono text-xs font-medium text-bg transition-transform active:scale-95"
          >
            limiter.consume(&quot;you&quot;)
          </button>
          <span className="font-mono text-[11px] text-muted">spam it ↑</span>
        </div>

        <ol className="mt-4 min-h-[118px] space-y-1 font-mono text-[11px]" aria-live="polite">
          {log.length === 0 && <li className="text-faint">// responses appear here</li>}
          {log.map((e) => (
            <li key={e.n} className="flex justify-between gap-3">
              <span className={e.allowed ? 'text-accent' : 'text-danger'}>
                #{e.n} {e.allowed ? '200 OK' : '429 Too Many Requests'}
              </span>
              <span className="text-muted">
                {e.allowed ? `remaining ${e.remaining}` : `retry in ${(e.retryAfterMs / 1000).toFixed(1)}s`}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {install && (
        <button
          type="button"
          onClick={copy}
          className="flex w-full items-center justify-between gap-3 border-t border-line px-4 py-3 text-left font-mono text-xs text-text transition-colors hover:bg-bg-3"
        >
          <span className="truncate">
            <span className="sr-only">Copy install command: </span>
            <span aria-hidden className="text-faint">
              ${' '}
            </span>
            {install}
          </span>
          {copied ? <Check className="h-3.5 w-3.5 shrink-0 text-accent" /> : <Copy className="h-3.5 w-3.5 shrink-0 text-muted" />}
        </button>
      )}
    </div>
  );
}
