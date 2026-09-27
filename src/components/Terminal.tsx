import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { X } from 'lucide-react';
import { PROFILE } from '../data/profile';
import { STATUS_LABEL, projects } from '../data/projects';
import { DIFFICULTY, STATUS_COPY, pad2, shortHash, useLedger, type Block } from '../lib/ledger';
import { lockScroll, scrollToId } from '../lib/scroll';

export const openTerminal = () => window.dispatchEvent(new Event('terminal:open'));
export const toggleTheme = () => window.dispatchEvent(new Event('theme:toggle'));

type Line = { id: number; node: ReactNode };

const COMMANDS = [
  'help', 'whoami', 'ls', 'cd', 'projects', 'open', 'contact', 'chain', 'block', 'verify', 'mine', 'restore',
  'npm i @osamaibrahim/rate-limiter', 'theme', 'tea', 'clear', 'exit',
];

const LINKS: Record<string, string> = {
  nook: 'https://osamaibrhim.github.io/Nook/',
  'job-catcher': 'https://job-catcher-sigma.vercel.app',
  'rate-limiter': PROFILE.npm,
  github: PROFILE.github,
  linkedin: PROFILE.linkedin,
  resume: PROFILE.resume,
};

const Dim = ({ children }: { children: ReactNode }) => <span className="text-muted">{children}</span>;
const Acc = ({ children }: { children: ReactNode }) => <span className="text-accent">{children}</span>;
const Warn = ({ children }: { children: ReactNode }) => <span className="text-warn">{children}</span>;
const Err = ({ children }: { children: ReactNode }) => <span className="text-danger">{children}</span>;

export default function Terminal() {
  const ledger = useLedger();
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState('');
  const [past, setPast] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const seq = useRef(0);

  const print = useCallback((...nodes: ReactNode[]) => {
    setLines((l) => [...l, ...nodes.map((node) => ({ id: seq.current++, node }))]);
  }, []);

  // Open with ` (backtick) anywhere outside a text field, or via openTerminal().
  useEffect(() => {
    const show = () => {
      returnFocus.current = document.activeElement as HTMLElement | null;
      setOpen(true);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);
      if (e.key === '`' && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        show();
      }
    };
    window.addEventListener('terminal:open', show);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('terminal:open', show);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    if (lines.length === 0) {
      print(
        <span>
          <Acc>osama@portfolio</Acc> · this page is a chain of {ledger.blocks.length} blocks you can talk to.
        </span>,
        <Dim>Type `help` to see what it understands. Esc to close.</Dim>,
      );
    }
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [lines]);

  const close = () => {
    setOpen(false);
    returnFocus.current?.focus?.();
  };

  const go = (id: string) => {
    close();
    lockScroll(false);
    setTimeout(() => scrollToId(id), 60);
  };

  const blockLine = (b: Block) => {
    const bad = b.status !== 'valid';
    return (
      <span>
        <Dim>#{pad2(b.index)}</Dim> <Warn>{shortHash(b.hash, 10, 4)}</Warn> {b.nav.padEnd(12, ' ')}
        {bad ? <Err>{STATUS_COPY[b.status]}</Err> : <Acc>{STATUS_COPY[b.status]}</Acc>}
      </span>
    );
  };

  const findBlock = (ref: string) => {
    const n = Number.parseInt(ref.replace('#', ''), 10);
    return ledger.blocks.find((b) => (!Number.isNaN(n) && b.index === n) || b.id === ref || b.nav.toLowerCase() === ref);
  };

  const run = (raw: string) => {
    const cmd = raw.trim().replace(/\s+/g, ' ');
    print(
      <span>
        <Acc>~</Acc> <Dim>$</Dim> {cmd}
      </span>,
    );
    if (!cmd) return;
    const [head, ...rest] = cmd.split(' ');
    const arg = rest.join(' ').toLowerCase();
    const { blocks, brokenAt, forked, ready } = ledger;

    const needChain = () => {
      if (ready) return false;
      print(<Dim>still mining the chain… try again in a moment</Dim>);
      return true;
    };

    switch (head.toLowerCase()) {
      case 'help':
        print(
          <Dim>about</Dim>,
          <span>  whoami · ls · cd &lt;section&gt; · projects · open &lt;nook|job-catcher|rate-limiter|github|linkedin|resume&gt; · contact</span>,
          <Dim>this page’s chain (real SHA-256, mined live)</Dim>,
          <span>  chain · block &lt;n|section&gt; · verify · mine · restore</span>,
          <Dim>misc</Dim>,
          <span>  npm i @osamaibrahim/rate-limiter · theme · tea · clear · exit</span>,
        );
        return;
      case 'whoami':
        print(
          <span>
            <Acc>{PROFILE.name}</Acc> · {PROFILE.role}, {PROFILE.discipline.toLowerCase()}
          </span>,
          <Dim>
            {PROFILE.location} · {PROFILE.availability.toLowerCase()} · TypeScript, Node.js, React, NestJS, MongoDB,
            PostgreSQL
          </Dim>,
        );
        return;
      case 'ls':
        print(<span>{[...blocks.map((b) => b.id + '/'), 'contact/'].join('   ')}</span>);
        return;
      case 'cd': {
        const target = arg.replace(/\/$/, '');
        const exists = target === 'contact' || blocks.some((b) => b.id === target);
        if (!target || target === '~' || target === '..') go('home');
        else if (exists) go(target);
        else print(<Err>cd: no such section: {target}</Err>);
        return;
      }
      case 'projects':
        projects.forEach((p, i) =>
          print(
            <span>
              <Dim>{pad2(i + 1)}</Dim> {p.title} <Dim>· {STATUS_LABEL[p.status].toLowerCase()}</Dim>
              {p.note && <Warn> · {p.note}</Warn>}
            </span>,
          ),
        );
        print(<Dim>try: open nook</Dim>);
        return;
      case 'open': {
        const url = LINKS[arg];
        if (url) {
          window.open(url, '_blank', 'noopener');
          print(<Dim>opening {arg} ↗</Dim>);
        } else print(<Err>open: unknown target. Try: {Object.keys(LINKS).join(', ')}</Err>);
        return;
      }
      case 'contact':
      case 'email':
        print(
          <span>
            <a className="text-accent underline" href={`mailto:${PROFILE.email}`}>
              {PROFILE.email}
            </a>{' '}
            <Dim>· or `cd contact` to write from here</Dim>
          </span>,
        );
        return;
      case 'chain':
      case 'log':
        if (needChain()) return;
        blocks.forEach((b) => print(blockLine(b)));
        return;
      case 'block':
      case 'show': {
        if (needChain()) return;
        const b = findBlock(arg || '0');
        if (!b) {
          print(<Err>block: no such block '{arg}'. Try 0–{blocks.length - 1} or a section name.</Err>);
          return;
        }
        print(
          <span>
            block <Acc>#{pad2(b.index)}</Acc> · {b.label}
          </span>,
          <Dim>prev  {b.prev}</Dim>,
          <Dim>nonce {b.nonce}</Dim>,
          <span>
            hash  <Warn>{b.hash}</Warn>
          </span>,
          <span>    “{b.claim}”</span>,
        );
        scrollToId(b.id); // scroll the page behind, keep the terminal open
        return;
      }
      case 'verify':
        if (needChain()) return;
        if (brokenAt === null) {
          print(
            <Acc>✓ chain valid</Acc>,
            <Dim>
              {blocks.length} blocks, every hash starts with {DIFFICULTY} and links to the one before it.
            </Dim>,
          );
          if (forked) print(<Warn>…but it differs from the original. Run `restore`.</Warn>);
        } else {
          const b = blocks[brokenAt];
          print(
            <Err>
              ✕ broken at block #{pad2(brokenAt)} ({b.nav}): {STATUS_COPY[b.status]}
            </Err>,
            <Dim>{blocks.length - brokenAt} block(s) affected. Run `mine` to re-mine or `restore` to undo.</Dim>,
          );
        }
        return;
      case 'mine':
        if (needChain()) return;
        if (brokenAt === null) print(<Dim>nothing to mine: the chain is already valid.</Dim>);
        else {
          print(<Warn>⛏ re-mining {blocks.length - brokenAt} block(s) from #{pad2(brokenAt)}…</Warn>);
          ledger.remine();
        }
        return;
      case 'restore':
      case 'reset':
        ledger.restore();
        print(<Acc>✓ original chain restored.</Acc>);
        return;
      case 'theme':
        toggleTheme();
        print(<Dim>theme toggled</Dim>);
        return;
      case 'tea':
      case 'shai':
        print(
          <span>
            brewing a glass of shai… <Acc>done</Acc>. Now we can ship.
          </span>,
        );
        return;
      case 'clear':
        setLines([]);
        return;
      case 'exit':
      case 'q':
        close();
        return;
      case 'sudo':
        print(<Err>osama is not in the sudoers file. This incident will be reported.</Err>);
        return;
      case 'rm':
        print(<Err>rm: refusing. Blocks are append-only. Try editing a sentence instead.</Err>);
        return;
      case 'npm':
      case 'pnpm':
      case 'yarn': {
        if (/rate-limiter/.test(arg)) {
          navigator.clipboard?.writeText('npm install @osamaibrahim/rate-limiter').catch(() => {});
          print(
            <span>
              Copied <Acc>npm install @osamaibrahim/rate-limiter</Acc> to your clipboard.
            </span>,
            <Dim>Zero runtime dependencies, so that’s all it adds to your project.</Dim>,
          );
        } else print(<Dim>This page only publishes one package: npm i @osamaibrahim/rate-limiter</Dim>);
        return;
      }
      default:
        print(<Err>command not found: {head}. Type `help`.</Err>);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = input;
      if (value.trim()) setPast((p) => [value, ...p].slice(0, 50));
      setCursor(-1);
      setInput('');
      run(value);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(cursor + 1, past.length - 1);
      if (past[next] !== undefined) {
        setCursor(next);
        setInput(past[next]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = cursor - 1;
      setCursor(next);
      setInput(next >= 0 ? past[next] : '');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const match = COMMANDS.find((c) => c.startsWith(input.toLowerCase()) && c !== input);
      if (input && match) setInput(match);
    } else if (e.key === 'Escape') {
      close();
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <m.div
          role="dialog"
          aria-modal="true"
          aria-label="Terminal"
          data-lenis-prevent
          className="fixed inset-x-2 bottom-2 z-[65] mx-auto flex h-[min(460px,70vh)] max-w-[760px] flex-col overflow-hidden rounded-[6px] border border-line-strong bg-bg-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] sm:bottom-6"
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onKeyDown={(e) => e.key === 'Escape' && close()}
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5 font-mono text-[11px] text-muted">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-danger/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-warn/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-accent/80" />
              <span className="ml-2">osama@portfolio: ~</span>
            </div>
            <button type="button" onClick={close} aria-label="Close terminal" className="text-muted hover:text-text">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div
            ref={bodyRef}
            data-lenis-prevent
            className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[12.5px] leading-[1.7] text-text"
            onClick={() => inputRef.current?.focus()}
          >
            {lines.map((l) => (
              <div key={l.id} className="whitespace-pre-wrap break-words">
                {l.node}
              </div>
            ))}
            <div className="flex items-center gap-2">
              <span className="text-accent">~</span>
              <span className="text-muted">$</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                aria-label="Terminal command"
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-text caret-accent outline-none focus:ring-0"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 border-t border-line px-3 py-2">
            {['help', 'whoami', 'chain', 'verify', 'projects', 'open nook'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  run(c);
                  inputRef.current?.focus();
                }}
                className="rounded-full border border-line px-2.5 py-1 font-mono text-[10.5px] text-muted transition-colors hover:border-text hover:text-text"
              >
                {c}
              </button>
            ))}
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
