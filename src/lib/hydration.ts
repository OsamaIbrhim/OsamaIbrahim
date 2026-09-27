/**
 * Tracks the page's hydration boundaries (App.tsx). React hydrates them one at
 * a time, so code that rewrites the DOM (the scroll effects split text into
 * lines and words) must wait until all of them are done, or React would find
 * markup it didn't render.
 */
let expected = 0;
const ready = new Set<string>();
let resolve!: () => void;
const allHydrated = new Promise<void>((r) => (resolve = r));

/** Declares the boundaries to wait for. */
export function expectIslands(ids: string[]) {
  expected = ids.length;
  if (!expected) resolve();
}

/** Called by each boundary once it has hydrated (idempotent, so StrictMode's double effects are fine). */
export function islandHydrated(id: string) {
  ready.add(id);
  if (ready.size >= expected) resolve();
}

/** Resolves once every boundary has hydrated. */
export const whenHydrated = () => allHydrated;
