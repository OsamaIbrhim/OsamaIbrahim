import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { ArrowUpRight, Check, Copy, Github, Linkedin } from 'lucide-react';
import { PROFILE } from '../data/profile';
import { DIFFICULTY, hashingAvailable, mine, pad2, sha256, shortHash, useLedger } from '../lib/ledger';

const WEB3FORMS_KEY = '409609cb-2ca7-414a-971b-46f369a1fd33';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Phase = 'idle' | 'mining' | 'sent' | 'error';

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(text);
    setTimeout(() => setCopied((c) => (c === text ? null : c)), 1800);
  };
  return { copied, copy };
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.12em] text-faint"
      >
        {label}
        {error && <span className="normal-case tracking-normal text-danger">{error}</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'mt-2 w-full border-0 border-b border-line-strong bg-transparent px-0 py-3 text-lg text-text placeholder:text-faint focus:border-accent focus:outline-none focus:ring-0 transition-colors';

export default function Contact() {
  const { head, blocks } = useLedger();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [phase, setPhase] = useState<Phase>('idle');
  const [hash, setHash] = useState('');
  const [nonce, setNonce] = useState(0);
  const { copied, copy } = useCopy();
  const attempt = useRef(0);

  const index = blocks.length;
  const payload = `${index}|Message|${head}|${name}|${email}|${message}|`;

  // The pending block's hash follows every keystroke.
  useEffect(() => {
    if (!hashingAvailable || phase === 'mining' || phase === 'sent') return;
    let alive = true;
    sha256(payload + 0).then((h) => {
      if (!alive) return;
      setHash(h);
      setNonce(0);
    });
    return () => {
      alive = false;
    };
  }, [payload, phase]);

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Your name, please';
    if (!email.trim()) e.email = 'Needed to reply';
    else if (!EMAIL_RE.test(email)) e.email = 'That address looks off';
    if (!message.trim()) e.message = 'Say a little something';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (phase === 'mining' || !validate()) return;
    const id = ++attempt.current;
    const current = () => attempt.current === id;
    setPhase('mining');

    const send = fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          name,
          email,
          message,
          subject: `New portfolio message from ${name}`,
        }),
      }).then((r) => r.json() as Promise<{ success?: boolean }>);

    // Mine the visitor's message into the chain while it is being delivered.
    const seal = hashingAvailable
      ? mine(
          payload,
          (n, h) => {
            setNonce(n);
            setHash(h);
          },
          () => !current(),
          10,
        ).then((r) => {
          setNonce(r.nonce);
          setHash(r.hash);
        })
      : Promise.resolve();

    try {
      const [res] = await Promise.all([send, seal]);
      if (!current()) return;
      if (!res.success) throw new Error('rejected');
      setPhase('sent');
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      if (!current()) return;
      attempt.current++; // stop the miner if the send failed first
      setPhase('error');
    }
  };

  const stateLabel =
    phase === 'sent' ? '✓ confirmed' : phase === 'mining' ? '⛏ mining' : phase === 'error' ? '✕ not sent' : '○ pending';
  const stateColor =
    phase === 'sent' ? 'var(--accent)' : phase === 'mining' ? 'var(--warn)' : phase === 'error' ? 'var(--danger)' : 'var(--muted)';

  return (
    <section
      id="contact"
      aria-label="Contact"
      className="relative mx-auto max-w-[1320px] px-4 sm:px-6 lg:grid lg:grid-cols-[136px_minmax(0,1fr)] lg:px-10"
    >
      <div aria-hidden className="relative hidden lg:block">
        <div className="absolute right-[35px] top-0 h-24 border-l border-dashed border-line-strong" />
        <div className="sticky top-28 flex items-start justify-end gap-3 pr-[24px] pt-[3px]">
          <div className="pt-[1px] text-right font-mono text-[11px] leading-tight text-muted">
            <div className="text-text">#{pad2(index)}</div>
            <div className="mt-1 uppercase tracking-[0.1em]">Contact</div>
          </div>
          <div className="relative z-10 grid shrink-0 h-[23px] w-[23px] place-items-center rounded-full border border-dashed border-line-strong bg-bg">
            <span className="h-[7px] w-[7px] rounded-full" style={{ background: stateColor }} />
          </div>
        </div>
      </div>

      <div className="min-w-0 pb-24">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-dashed border-line-strong py-3 font-mono text-[11px] text-muted">
          <span className="text-text">
            <span className="lg:hidden">#{pad2(index)} · </span>BLOCK · YOUR MESSAGE
          </span>
          <span className="whitespace-nowrap">
            <span className="text-faint">prev </span>
            <span className="tabular">{shortHash(head, 6, 4)}</span>
          </span>
          <span className="whitespace-nowrap">
            <span className="text-faint">nonce </span>
            <span className="tabular">{nonce}</span>
          </span>
          <span className="whitespace-nowrap">
            <span className="text-faint">hash </span>
            <span
              className="tabular"
              style={{ color: hash.startsWith(DIFFICULTY) && phase !== 'idle' ? 'var(--accent)' : undefined }}
            >
              {shortHash(hash, 8, 6)}
            </span>
          </span>
          <span className="ml-auto whitespace-nowrap" style={{ color: stateColor }}>
            {stateLabel}
          </span>
        </div>

        <div className="grid gap-16 pt-10 sm:pt-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow">Contact</p>
            <h2 data-split className="display mt-5 text-[clamp(2.8rem,6.5vw,5.75rem)]">
              Add the
              <br />
              <em>next block.</em>
            </h2>
            <p className="mt-6 max-w-[34ch] text-[1.0625rem] leading-relaxed text-muted">
              A role, a project, or just a question: write it below. Your message is hashed onto this page’s
              chain as you type, mined when you send it, and delivered to my inbox.
            </p>

            <div className="mt-12 border-t border-line">
              {[
                { k: 'Email', v: PROFILE.email, href: `mailto:${PROFILE.email}`, copyText: PROFILE.email, external: false },
                {
                  k: 'WhatsApp',
                  v: PROFILE.whatsappDisplay,
                  href: `https://wa.me/${PROFILE.whatsapp}`,
                  copyText: PROFILE.whatsappDisplay,
                  external: true,
                },
              ].map((row) => (
                <div key={row.k} className="flex items-center justify-between gap-4 border-b border-line py-4">
                  <div className="min-w-0">
                    <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint">{row.k}</div>
                    <a
                      href={row.href}
                      target={row.external ? '_blank' : undefined}
                      rel="noreferrer"
                      className="link-underline mt-1 inline-block max-w-full truncate text-text"
                    >
                      {row.v}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => copy(row.copyText)}
                    aria-label={`Copy ${row.k}`}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line-strong text-muted transition-colors hover:border-text hover:text-text"
                  >
                    {copied === row.copyText ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { label: 'LinkedIn', href: PROFILE.linkedin, icon: <Linkedin className="h-4 w-4" /> },
                { label: 'GitHub', href: PROFILE.github, icon: <Github className="h-4 w-4" /> },
                { label: 'npm', href: PROFILE.npm, icon: null },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-sm text-text transition-colors hover:border-text"
                >
                  {s.icon}
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <AnimatePresence mode="wait">
              {phase === 'sent' ? (
                <m.div
                  key="sent"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-[3px] border border-accent bg-accent-soft p-8"
                >
                  <div className="font-mono text-[11px] text-accent">BLOCK #{pad2(index)} · CONFIRMED</div>
                  <p className="display mt-4 text-4xl">Message received.</p>
                  <p className="mt-3 text-muted">
                    It’s in my inbox, sealed with nonce <span className="font-mono text-text">{nonce}</span>. I’ll get back
                    to you by email.
                  </p>
                  <div className="mt-4 break-all font-mono text-[11px] text-muted">{hash}</div>
                  <button type="button" onClick={() => setPhase('idle')} className="link-underline mt-6 text-sm text-text">
                    Write another
                  </button>
                </m.div>
              ) : (
                <m.form
                  key="form"
                  onSubmit={onSubmit}
                  noValidate
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <Field id="c-name" label="Name" error={errors.name}>
                    <input
                      id="c-name"
                      name="name"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((x) => ({ ...x, name: undefined }));
                      }}
                      placeholder="Your name"
                      className={inputCls}
                    />
                  </Field>
                  <Field id="c-email" label="Email" error={errors.email}>
                    <input
                      id="c-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((x) => ({ ...x, email: undefined }));
                      }}
                      placeholder="you@company.com"
                      className={inputCls}
                    />
                  </Field>
                  <Field id="c-msg" label="Message" error={errors.message}>
                    <textarea
                      id="c-msg"
                      name="message"
                      rows={4}
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (errors.message) setErrors((x) => ({ ...x, message: undefined }));
                      }}
                      placeholder="What are we building?"
                      className={`${inputCls} resize-none`}
                    />
                  </Field>

                  <div className="flex flex-wrap items-center gap-5 pt-2">
                    <button
                      data-magnetic
                      type="submit"
                      disabled={phase === 'mining'}
                      className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-on-accent transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-70"
                    >
                      {phase === 'mining' ? `Mining… nonce ${nonce}` : 'Mine & send'}
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
                    </button>
                    {phase === 'error' && (
                      <span className="text-sm text-danger">That didn’t go through. Try again, or email me directly.</span>
                    )}
                  </div>
                </m.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
