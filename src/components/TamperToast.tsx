import { AnimatePresence, m } from 'motion/react';
import { pad2, shortHash, useLedger } from '../lib/ledger';

/** Narrates what tampering does, and what it would take to get away with it. */
export default function TamperToast() {
  const { blocks, brokenAt, remining, forked, remine, restore } = useLedger();

  let mode: 'broken' | 'remining' | 'forked' | null = null;
  if (remining !== null) mode = 'remining';
  else if (brokenAt !== null) mode = 'broken';
  else if (forked) mode = 'forked';

  const downstream = brokenAt !== null ? blocks.length - brokenAt : 0;
  const miningBlock = remining !== null ? blocks.find((b) => b.status === 'mining') : undefined;
  const broken = brokenAt !== null ? blocks[brokenAt] : null;

  return (
    <AnimatePresence>
      {mode && (
        <m.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-[580px] rounded-[4px] border bg-bg-2 p-4 shadow-2xl sm:bottom-5 sm:p-5"
          style={{
            borderColor: mode === 'broken' ? 'var(--danger)' : mode === 'remining' ? 'var(--warn)' : 'var(--line-strong)',
          }}
        >
          {mode === 'broken' && broken && (
            <>
              <div className="font-mono text-[11px] text-danger">
                ✕ CHAIN BROKEN AT BLOCK #{pad2(broken.index)} · hash {shortHash(broken.hash, 6, 4)}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-text">
                You changed one sentence. Its hash no longer starts with <span className="font-mono">000</span>, so{' '}
                {downstream > 1 ? `all ${downstream} blocks from #${pad2(broken.index)} on are` : 'this block is'} now
                invalid. Tamper-evidence in one move: nobody can quietly rewrite what came before.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={remine}
                  className="rounded-full bg-text px-4 py-2 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
                >
                  Re-mine {downstream} block{downstream > 1 ? 's' : ''}
                </button>
                <button
                  type="button"
                  onClick={restore}
                  className="rounded-full border border-line-strong px-4 py-2 text-sm text-text transition-colors hover:border-text"
                >
                  Restore the truth
                </button>
              </div>
            </>
          )}

          {mode === 'remining' && remining !== null && (
            <>
              <div className="font-mono text-[11px] text-warn">⛏ RE-MINING FROM BLOCK #{pad2(remining)}</div>
              <p className="mt-2 text-sm leading-relaxed text-text">
                Every block after your edit needs a brand-new proof of work.{' '}
                {miningBlock && (
                  <span className="font-mono text-muted">
                    #{pad2(miningBlock.index)} · nonce <span className="tabular text-text">{miningBlock.nonce}</span>
                  </span>
                )}
              </p>
            </>
          )}

          {mode === 'forked' && (
            <>
              <div className="font-mono text-[11px] text-warn">⚠ VALID, BUT ONLY ON YOUR MACHINE</div>
              <p className="mt-2 text-sm leading-relaxed text-text">
                Your rewritten chain checks out locally. Every other copy still holds the original, so yours loses.
                The real record stays the real record. Nice try.
              </p>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={restore}
                  className="rounded-full bg-text px-4 py-2 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
                >
                  Restore the original
                </button>
              </div>
            </>
          )}
        </m.div>
      )}
    </AnimatePresence>
  );
}
