import { CopyButton } from './CopyButton';

const JSON_TOKEN_PATTERN = /"(?:\\.|[^"\\])*"(?=\s*:)|"(?:\\.|[^"\\])*"|\b(?:true|false|null)\b/g;

function shellTokenClass(token) {
  if (token === 'npx') return 'syntax-pink';
  if (token === 'no-author') return 'syntax-green';
  if (token.startsWith('--')) return 'syntax-blue';
  return undefined;
}

function highlightShell(text) {
  return text.split(/(\s+)/).map((token, index) => (
    <span className={shellTokenClass(token)} key={`${token}-${index}`}>{token}</span>
  ));
}

function jsonTokenClass(token, text, end) {
  if (token === 'true' || token === 'false' || token === 'null') return 'syntax-pink';
  return /^\s*:/.test(text.slice(end)) ? 'syntax-blue' : 'syntax-green';
}

function highlightJson(text) {
  const tokens = [];
  let cursor = 0;

  for (const match of text.matchAll(JSON_TOKEN_PATTERN)) {
    if (match.index > cursor) tokens.push(text.slice(cursor, match.index));
    tokens.push(<span className={jsonTokenClass(match[0], text, match.index + match[0].length)} key={match.index}>{match[0]}</span>);
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) tokens.push(text.slice(cursor));
  return tokens;
}

const HIGHLIGHTERS = {
  shell: highlightShell,
  json: highlightJson,
};

export function CodeBlock({ children, language }) {
  const text = String(children);
  const isShell = language === 'shell';
  const highlightedText = HIGHLIGHTERS[language]?.(text) ?? text;

  return (
    <div className={`code-block${isShell ? ' code-block--command' : ''}`}>
      <pre>
        <code>
          {isShell ? <span className="command-prompt" aria-hidden="true">$ </span> : null}
          {highlightedText}
        </code>
      </pre>
      <CopyButton text={text} />
    </div>
  );
}
