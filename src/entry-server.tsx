/**
 * Build-time prerender entry (see scripts/prerender.mjs): renders the page to
 * static HTML so the first paint and search engines don't wait for JavaScript.
 * The client then hydrates this markup (src/main.tsx).
 */
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
