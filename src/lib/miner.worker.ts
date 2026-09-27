/// <reference lib="webworker" />
// Proof-of-work off the main thread: scrolling, WebGL and React never wait on it.
// The main thread cancels by terminating the worker, so the loop needs no yields.
// One worker serves every block, one job at a time.

const encoder = new TextEncoder();

async function sha256(message: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(message));
  let hex = '';
  for (const byte of new Uint8Array(digest)) hex += byte.toString(16).padStart(2, '0');
  return hex;
}

// Jobs arrive one at a time (the main thread awaits each), tagged with an id.
self.onmessage = async (e: MessageEvent<{ job: number; prefix: string; difficulty: string }>) => {
  const { job, prefix, difficulty } = e.data;
  const batch = 1024;
  let lastReport = 0;
  for (let start = 0; ; start += batch) {
    const hashes = await Promise.all(Array.from({ length: batch }, (_, i) => sha256(prefix + (start + i))));
    const hit = hashes.findIndex((h) => h.startsWith(difficulty));
    if (hit >= 0) {
      self.postMessage({ job, type: 'done', nonce: start + hit, hash: hashes[hit] });
      return;
    }
    const now = performance.now();
    if (now - lastReport > 80) {
      lastReport = now;
      self.postMessage({ job, type: 'progress', nonce: start + batch - 1, hash: hashes[batch - 1] });
    }
  }
};
