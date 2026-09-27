import type { ReactNode } from 'react';
import { STATUS_COPY, STATUS_EXPLAIN, pad2, shortHash, useLedger, type BlockStatus } from '../lib/ledger';

export const statusColor = (s: BlockStatus) =>
  s === 'valid' ? 'var(--accent)' : s === 'mining' ? 'var(--warn)' : 'var(--danger)';

export function StatusBadge({ status }: { status: BlockStatus }) {
  const bad = status !== 'valid' && status !== 'mining';
  return (
    <span
      title={STATUS_EXPLAIN[status]}
      className="inline-flex items-center gap-1.5 whitespace-nowrap"
      style={{ color: statusColor(status) }}
    >
      <span
        aria-hidden
        className={`inline-block h-1.5 w-1.5 rounded-full ${status === 'mining' ? 'pulse-dot' : ''}`}
        style={{ background: statusColor(status) }}
      />
      {bad ? '✕ ' : ''}
      {STATUS_COPY[status]}
    </span>
  );
}

function HeaderField({ k, v, danger }: { k: string; v: string; danger?: boolean }) {
  return (
    <span className="whitespace-nowrap">
      <span>{k} </span>
      <span className="tabular text-text" style={{ color: danger ? 'var(--danger)' : undefined }}>
        {v}
      </span>
    </span>
  );
}

/** A section of the page, rendered as a block in the chain. */
export default function BlockFrame({
  index,
  children,
  className = '',
}: {
  index: number;
  children: ReactNode;
  className?: string;
}) {
  const { blocks } = useLedger();
  const b = blocks[index];
  const color = statusColor(b.status);

  return (
    <section
      id={b.id}
      aria-label={b.nav}
      data-block={index}
      className={`relative mx-auto max-w-[1320px] px-4 sm:px-6 lg:grid lg:grid-cols-[136px_minmax(0,1fr)] lg:px-10 ${className}`}
    >
      {/* Spine: the visible link between this block and the next. */}
      <div aria-hidden className="relative hidden lg:block">
        <div
          className="absolute bottom-0 right-[35px] top-0 w-px transition-colors duration-500"
          style={{ background: color, opacity: 0.55 }}
        />
        <div className="sticky top-28 flex items-start justify-end gap-3 pr-[24px] pt-[3px]">
          <div className="pt-[1px] text-right font-mono text-[11px] leading-tight text-muted">
            <div className="text-text">#{pad2(index)}</div>
            <div className="mt-1 uppercase tracking-[0.1em]">{b.nav}</div>
          </div>
          <div
            className="relative z-10 grid h-[23px] w-[23px] shrink-0 place-items-center rounded-full border bg-bg transition-colors duration-500"
            style={{ borderColor: color }}
          >
            <span className="h-[7px] w-[7px] rounded-full" style={{ background: color }} />
          </div>
        </div>
      </div>

      <div className="min-w-0 pb-28 sm:pb-40">
        {/* Block header: the machine-readable truth about this section. */}
        <div
          className="block-header flex flex-wrap items-center gap-x-5 gap-y-1 border-t py-3 font-mono text-[11px] text-muted transition-colors duration-500"
          style={{ borderColor: b.status === 'valid' ? 'var(--line-strong)' : color }}
        >
          <span className="text-text">
            <span className="lg:hidden">#{pad2(index)} · </span>
            BLOCK · {b.label.toUpperCase()}
          </span>
          <HeaderField k="prev" v={shortHash(b.prev, 6, 4)} danger={b.status === 'unlinked'} />
          <HeaderField k="nonce" v={String(b.nonce)} />
          <HeaderField k="hash" v={shortHash(b.hash, 8, 6)} danger={b.status === 'tampered'} />
          <span className="ml-auto">
            <StatusBadge status={b.status} />
          </span>
        </div>
        <div className="pt-10 sm:pt-14">{children}</div>
      </div>
    </section>
  );
}
