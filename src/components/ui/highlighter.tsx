import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {dracula as draculaRaw} from 'react-syntax-highlighter/dist/cjs/styles/prism';

const dracula = { ...draculaRaw };
const preKey = Object.keys(dracula).find((k) => k.startsWith('pre['));
if (preKey) {
  const { overflow, ...rest } = dracula[preKey] as Record<string, unknown>;
  dracula[preKey] = { ...rest, overflow: 'visible' };
}

export function CodeBlock({ code, language }: { code: string, language: string }) {
  return (
    <SyntaxHighlighter
      language={language}
      style={dracula}
      customStyle={{
        background: 'transparent',
        padding: '0.5rem',
        borderRadius: '0.5rem',
        overflow: 'visible',
      }}
    >
      {code}
    </SyntaxHighlighter>
  )
}
