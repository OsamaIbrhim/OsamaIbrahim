import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useLedger } from '../lib/ledger';

const MAX = 180;

/**
 * The editable, hashed sentence of a block. Uncontrolled on purpose: React
 * never rewrites the text while you type (which would jump the caret); a
 * restore remounts it via `resetKey`.
 */
function ClaimInner({ index, className }: { index: number; className: string }) {
  const { blocks, edit, ready, remining } = useLedger();
  const b = blocks[index];
  const ref = useRef<HTMLSpanElement>(null);
  const editable = ready && remining === null;
  // The sentence as it was at mount. Rendered as the initial text so it's in
  // the prerendered HTML; it never changes afterwards, so React never rewrites
  // the text under the caret while someone is typing.
  const [initial] = useState(b.claim);

  useEffect(() => {
    if (ref.current && ref.current.textContent !== b.claim) ref.current.textContent = b.claim;
    // Set once on mount; afterwards the DOM is the source of truth while typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
  };

  const onInput = () => {
    const el = ref.current;
    if (!el) return;
    let text = el.textContent ?? '';
    if (text.length > MAX) {
      text = text.slice(0, MAX);
      el.textContent = text;
    }
    edit(index, text);
  };

  return (
    <span
      ref={ref}
      role="textbox"
      aria-label={`Editable sentence sealed in block ${index}. Changing it breaks the chain.`}
      aria-multiline="false"
      contentEditable={editable ? 'plaintext-only' : false}
      suppressContentEditableWarning
      spellCheck={false}
      data-tampered={b.status === 'tampered'}
      onInput={onInput}
      onKeyDown={onKeyDown}
      onPaste={(e) => {
        // Firefox < 136 lacks plaintext-only; keep pasted content as text.
        e.preventDefault();
        document.execCommand('insertText', false, e.clipboardData.getData('text/plain').replace(/\s+/g, ' '));
      }}
      className={`claim ${className}`}
    >
      {initial}
    </span>
  );
}

export default function Claim({ index, className = '' }: { index: number; className?: string }) {
  const { resetKey } = useLedger();
  return <ClaimInner key={resetKey} index={index} className={className} />;
}
