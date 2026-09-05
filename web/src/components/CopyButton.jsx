import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef();

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  async function copy() {
    if (!navigator.clipboard) return;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), 1200);
  }

  return (
    <button className="code-copy-button" onClick={copy} aria-label={copied ? 'Copied' : 'Copy code'}>
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
    </button>
  );
}
