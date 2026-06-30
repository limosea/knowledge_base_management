import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export function CodeBlock({ code, language }: { code: string, language: string }) {
  const lines = code.split('\n');
  const lineCount = lines.length;

  return (
    <div className="syntax-highlighter-wrapper">
      <div className="line-numbers" aria-hidden="true">
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className="line-number">
            {i + 1}
          </div>
        ))}
      </div>
      <div className="code-content">
        <SyntaxHighlighter
          language={language}
          style={dracula}
          customStyle={{
            background: 'transparent',
            padding: '1rem',
            margin: '0',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}