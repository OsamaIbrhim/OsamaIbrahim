import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { BLOCKS } from '../data/blocks';

// ── Hashing (native Web Crypto) ─────────────────────────────
export const DIFFICULTY = '000';
export const ZERO_HASH = '0'.repeat(64);

const encoder = new TextEncoder();
export const hashingAvailable =
  typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.subtle !== 'undefined';

export async function sha256(message: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(message));
  let hex = '';
  for (const byte of new Uint8Array(digest)) hex += byte.toString(16).padStart(2, '0');
  return hex;
}

export const shortHash = (hash: string, head = 8, tail = 6) =>
  !hash ? '—' : hash.length <= head + tail ? hash : `${hash.slice(0, head)}…${hash.slice(-tail)}`;

export const pad2 = (n: number) => String(n).padStart(2, '0');

export const blockPayload = (index: number, label: string, prev: string, claim: string) =>
  `${index}|${label}|${prev}|${claim}|`;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Yield through a MessageChannel rather than rAF or setTimeout(0): rAF pauses
// in background tabs and timers get throttled to ~1s, which would stall mining.
const yieldToBrowser = () =>
  new Promise<void>((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => resolve();
    channel.port2.postMessage(0);
  });

type MineResult = { nonce: number; hash: string };

// One long-lived worker for every block; it is only replaced after a cancel.
let sharedWorker: Worker | null = null;
let jobSeq = 0;
const getWorker = () =>
  (sharedWorker ??= new Worker(new URL('./miner.worker.ts', import.meta.url), { type: 'module' }));

/** Runs the search in a Web Worker; cancelling terminates it. */
function mineInWorker(
  prefix: string,
  onProgress?: (nonce: number, hash: string) => void,
  isCancelled?: () => boolean,
): Promise<MineResult> {
  return new Promise((resolve, reject) => {
    let worker: Worker;
    try {
      worker = getWorker();
    } catch {
      reject(new Error('no-worker'));
      return;
    }
    const job = ++jobSeq;
    const finish = () => {
      clearInterval(poll);
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onError);
    };
    const poll = setInterval(() => {
      if (!isCancelled?.()) return;
      finish();
      worker.terminate();
      if (sharedWorker === worker) sharedWorker = null;
      reject(new Error('cancelled'));
    }, 50);
    const onMessage = (e: MessageEvent<{ job: number; type: 'progress' | 'done'; nonce: number; hash: string }>) => {
      if (e.data.job !== job) return;
      if (e.data.type === 'progress') {
        if (!isCancelled?.()) onProgress?.(e.data.nonce, e.data.hash);
        return;
      }
      finish();
      if (isCancelled?.()) reject(new Error('cancelled'));
      else resolve({ nonce: e.data.nonce, hash: e.data.hash });
    };
    const onError = () => {
      finish();
      worker.terminate();
      if (sharedWorker === worker) sharedWorker = null;
      reject(new Error('no-worker'));
    };
    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onError);
    worker.postMessage({ job, prefix, difficulty: DIFFICULTY });
  });
}

/**
 * Proof-of-work: find a nonce whose hash starts with DIFFICULTY.
 * Hashes in batches and yields between them so the page never locks up;
 * `onProgress` reports the last nonce tried so the UI can show the search.
 * `paceMs` slows the search just enough for the ticker to be seen.
 */
export async function mine(
  prefix: string,
  onProgress?: (nonce: number, hash: string) => void,
  isCancelled?: () => boolean,
  paceMs = 0,
): Promise<MineResult> {
  const pace = prefersReducedMotion() ? 0 : paceMs;
  // Unpaced work (the initial chain) goes to a worker; paced work stays here
  // because its whole point is to be watched, and it is small.
  if (pace === 0 && typeof Worker !== 'undefined') {
    try {
      return await mineInWorker(prefix, onProgress, isCancelled);
    } catch (err) {
      if ((err as Error).message === 'cancelled') throw err;
      // otherwise fall through to the main-thread loop
    }
  }
  // Unpaced (initial) mining uses big batches: fewer yields, done sooner.
  const batch = pace > 0 ? 256 : 1024;
  for (let start = 0; ; start += batch) {
    const hashes = await Promise.all(Array.from({ length: batch }, (_, i) => sha256(prefix + (start + i))));
    if (isCancelled?.()) throw new Error('cancelled');
    const hit = hashes.findIndex((h) => h.startsWith(DIFFICULTY));
    if (hit >= 0) return { nonce: start + hit, hash: hashes[hit] };
    onProgress?.(start + batch - 1, hashes[batch - 1]);
    // Pacing is cosmetic: only when the tab is visible, so hidden tabs finish fast.
    if (pace > 0 && document.visibilityState === 'visible') await new Promise<void>((r) => setTimeout(r, pace));
    else await yieldToBrowser();
  }
}

// ── Chain state ─────────────────────────────────────────────
export type BlockStatus = 'mining' | 'valid' | 'tampered' | 'unlinked' | 'orphaned';

export interface Block {
  index: number;
  id: string;
  nav: string;
  label: string;
  claim: string;
  prev: string;
  nonce: number;
  hash: string;
  sealed: boolean;
  status: BlockStatus;
}

interface Stored {
  claim: string;
  prev: string;
  nonce: number;
  hash: string;
  sealed: boolean;
}

interface LedgerValue {
  available: boolean;
  blocks: Block[];
  head: string;
  ready: boolean;
  progress: number;
  brokenAt: number | null;
  forked: boolean;
  remining: number | null;
  resetKey: number;
  edit: (index: number, claim: string) => void;
  remine: () => void;
  restore: () => void;
}

const LedgerContext = createContext<LedgerValue | null>(null);

function evaluate(store: Stored[]): { statuses: BlockStatus[]; brokenAt: number | null } {
  let brokenAt: number | null = null;
  const statuses = store.map((b, i): BlockStatus => {
    if (!b.sealed) return 'mining';
    const expectedPrev = i === 0 ? ZERO_HASH : store[i - 1].hash;
    let s: BlockStatus = 'valid';
    if (!b.hash.startsWith(DIFFICULTY)) s = 'tampered';
    else if (b.prev !== expectedPrev) s = 'unlinked';
    else if (brokenAt !== null) s = 'orphaned';
    if (s !== 'valid' && brokenAt === null) brokenAt = i;
    return s;
  });
  return { statuses, brokenAt };
}

export function LedgerProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Stored[]>(() =>
    BLOCKS.map((b) => ({ claim: b.claim, prev: '', nonce: 0, hash: '', sealed: false })),
  );
  const [ready, setReady] = useState(false);
  const [remining, setRemining] = useState<number | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const original = useRef<Stored[] | null>(null);
  const storeRef = useRef(store);
  storeRef.current = store;
  const editGen = useRef<number[]>(BLOCKS.map(() => 0));
  const epoch = useRef(0);

  const patch = useCallback((i: number, next: Partial<Stored>) => {
    storeRef.current = storeRef.current.map((b, j) => (j === i ? { ...b, ...next } : b));
    setStore(storeRef.current);
  }, []);

  // Mine blocks [from..end] in order, each linking to the freshly mined previous hash.
  const mineFrom = useCallback(
    async (from: number, myEpoch: number, pace = 0) => {
      let prevHash = from === 0 ? ZERO_HASH : storeRef.current[from - 1].hash;
      for (let i = from; i < BLOCKS.length; i++) {
        const def = BLOCKS[i];
        const claim = storeRef.current[i].claim;
        patch(i, { sealed: false, prev: prevHash, nonce: 0, hash: '' });
        let lastPaint = 0;
        const result = await mine(
          blockPayload(i, def.label, prevHash, claim),
          (nonce, hash) => {
            const now = performance.now();
            if (now - lastPaint > 120) {
              lastPaint = now;
              patch(i, { nonce, hash });
            }
          },
          () => epoch.current !== myEpoch,
          pace,
        );
        patch(i, { ...result, prev: prevHash, sealed: true });
        prevHash = result.hash;
      }
    },
    [patch],
  );

  // Genesis: mine the whole chain once on load.
  useEffect(() => {
    if (!hashingAvailable) return;
    const myEpoch = ++epoch.current;
    mineFrom(0, myEpoch)
      .then(() => {
        if (epoch.current !== myEpoch) return;
        original.current = storeRef.current.map((b) => ({ ...b }));
        setReady(true);
      })
      .catch(() => {});
    return () => {
      epoch.current++;
    };
  }, [mineFrom]);

  // Editing a claim re-hashes only that block with its old nonce, exactly like
  // tampering with a real block. The damage downstream is found by `evaluate`.
  const edit = useCallback(
    (index: number, claim: string) => {
      if (!ready || remining !== null) return;
      const gen = ++editGen.current[index];
      const b = storeRef.current[index];
      patch(index, { claim });
      sha256(blockPayload(index, BLOCKS[index].label, b.prev, claim) + b.nonce).then((hash) => {
        if (editGen.current[index] !== gen) return;
        patch(index, { hash });
      });
    },
    [patch, ready, remining],
  );

  const { statuses, brokenAt } = useMemo(() => evaluate(store), [store]);

  const remine = useCallback(() => {
    if (brokenAt === null || remining !== null) return;
    const myEpoch = ++epoch.current;
    setRemining(brokenAt);
    mineFrom(brokenAt, myEpoch, 12)
      .catch(() => {})
      .finally(() => {
        if (epoch.current === myEpoch) setRemining(null);
      });
  }, [brokenAt, mineFrom, remining]);

  const restore = useCallback(() => {
    if (!original.current) return;
    epoch.current++;
    editGen.current = editGen.current.map((g) => g + 1);
    storeRef.current = original.current.map((b) => ({ ...b }));
    setStore(storeRef.current);
    setRemining(null);
    setResetKey((k) => k + 1);
  }, []);

  const forked =
    ready && original.current !== null && store.some((b, i) => b.claim !== original.current![i].claim);

  const blocks: Block[] = BLOCKS.map((def, i) => ({ ...def, ...store[i], status: statuses[i] }));
  const sealedCount = store.filter((b) => b.sealed).length;

  const value: LedgerValue = {
    available: hashingAvailable,
    blocks,
    head: store[store.length - 1].hash,
    ready,
    progress: sealedCount / BLOCKS.length,
    brokenAt: ready ? brokenAt : null,
    forked,
    remining,
    resetKey,
    edit,
    remine,
    restore,
  };

  return <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>;
}

export function useLedger() {
  const ctx = useContext(LedgerContext);
  if (!ctx) throw new Error('useLedger must be used inside <LedgerProvider>');
  return ctx;
}

export const STATUS_COPY: Record<BlockStatus, string> = {
  mining: 'mining',
  valid: 'sealed',
  tampered: 'tampered',
  unlinked: 'link broken',
  orphaned: 'orphaned',
};

export const STATUS_EXPLAIN: Record<BlockStatus, string> = {
  mining: 'Searching for a nonce whose hash starts with 000.',
  valid: 'Hash meets the difficulty target and links to the previous block.',
  tampered: 'Content changed, so the hash no longer meets the difficulty target.',
  unlinked: 'Stored previous-hash no longer matches the block before it.',
  orphaned: 'Sits on top of a broken link, so the chain cannot vouch for it.',
};
