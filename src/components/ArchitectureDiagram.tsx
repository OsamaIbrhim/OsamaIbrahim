/**
 * ATHR's architecture, drawn from its README: a Next.js admin and an offline
 * Electron POS talk to one NestJS API; PostgreSQL is the system of record; the
 * POS queues sales in a local SQLite outbox while offline.
 */
export default function ArchitectureDiagram() {
  const node = (x: number, y: number, w: number, title: string, sub: string, strong = false) => (
    <g transform={`translate(${x} ${y})`}>
      <rect
        width={w}
        height={62}
        rx={4}
        fill={strong ? 'var(--accent-soft)' : 'var(--bg)'}
        stroke={strong ? 'var(--accent)' : 'var(--line-strong)'}
      />
      <text x={14} y={26} fill="var(--text)" fontFamily="var(--font-sans)" fontSize={15} fontWeight={500}>
        {title}
      </text>
      <text x={14} y={45} fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={10.5}>
        {sub}
      </text>
    </g>
  );

  return (
    <div className="overflow-hidden rounded-[3px] border border-line-strong bg-bg-2">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5 font-mono text-[10.5px] text-muted">
        <span>architecture · modular monolith</span>
        <span className="text-warn">in development</span>
      </div>
      <svg viewBox="0 0 520 330" className="block w-full" role="img" aria-label="ATHR architecture diagram">
        <defs>
          <marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="var(--muted)" />
          </marker>
        </defs>

        {/* flows */}
        <g stroke="var(--accent)" strokeWidth={1.4} fill="none" markerEnd="url(#arr)">
          <path className="flow-line" d="M100 106 L100 151 L184 151" />
          <path className="flow-line" d="M400 106 L400 140 L338 140" />
          <path className="flow-line" d="M261 182 L261 234" />
          <path className="flow-line" d="M450 106 L450 234" />
          <path className="flow-line" d="M370 262 C 352 262, 352 170, 338 166" />
        </g>

        {node(24, 44, 150, 'Admin web', 'Next.js · Arabic RTL')}
        {node(346, 44, 150, 'Cashier POS', 'Electron · SQLite')}
        {node(186, 120, 150, 'ATHR API', 'NestJS · JWT · DTOs', true)}
        {node(186, 236, 150, 'PostgreSQL', 'system of record')}
        {node(370, 236, 126, 'Outbox', 'offline sales')}

        <text x={24} y={312} fill="var(--faint)" fontFamily="var(--font-mono)" fontSize={10}>
          idempotent sync by sync_id · transactional stock · rotating refresh tokens
        </text>
      </svg>
    </div>
  );
}
