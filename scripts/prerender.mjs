// Build step: render the app to static HTML and put it inside #root in
// dist/index.html, so the page paints (and search engines read it) before any
// JavaScript runs. The client then hydrates this markup (src/main.tsx).
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ssrDir = resolve('dist-ssr');
const { render } = await import(pathToFileURL(resolve(ssrDir, 'entry-server.js')).href);
const page = resolve('dist/index.html');
const template = readFileSync(page, 'utf8');
const slot = '<div id="root"></div>';
if (!template.includes(slot)) throw new Error(`prerender: ${slot} not found in dist/index.html`);
const html = render();
writeFileSync(page, template.replace(slot, `<div id="root">${html}</div>`));
rmSync(ssrDir, { recursive: true, force: true });
console.log(`prerender: wrote ${(html.length / 1024).toFixed(1)} KB of HTML into dist/index.html`);
