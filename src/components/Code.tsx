import { Fragment, type ReactNode } from 'react';

// A deliberately tiny highlighter: comments, strings, keywords, calls.
const KEYWORDS = new Set([
  'async', 'await', 'function', 'const', 'let', 'return', 'if', 'else', 'new', 'export',
  'for', 'of', 'throw', 'try', 'catch', 'import', 'from',
]);

const TOKEN = /(\/\/[^\n]*)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|([A-Za-z_$][\w$]*)(?=\s*\()|([A-Za-z_$][\w$]*)|([{}()[\];,.=<>+!:?]+)/g;

export default function Code({ source }: { source: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of source.matchAll(TOKEN)) {
    const at = m.index ?? 0;
    if (at > last) parts.push(<Fragment key={i++}>{source.slice(last, at)}</Fragment>);
    const [text, comment, str, call, word, punct] = m;
    const cls = comment
      ? 'tok-c'
      : str
        ? 'tok-s'
        : call
          ? KEYWORDS.has(call) ? 'tok-k' : 'tok-f'
          : word
            ? KEYWORDS.has(word) ? 'tok-k' : ''
            : punct
              ? 'tok-p'
              : '';
    parts.push(
      cls ? (
        <span key={i++} className={cls}>
          {text}
        </span>
      ) : (
        <Fragment key={i++}>{text}</Fragment>
      ),
    );
    last = at + text.length;
  }
  if (last < source.length) parts.push(<Fragment key={i++}>{source.slice(last)}</Fragment>);

  return (
    <pre className="code overflow-x-auto whitespace-pre">
      <code>{parts}</code>
    </pre>
  );
}
