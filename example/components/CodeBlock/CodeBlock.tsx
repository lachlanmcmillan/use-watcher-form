import { useEffect, useState } from 'react';
import { codeToHtml } from 'shiki';
import classes from './codeBlock.module.css';

export const CodeBlock = ({ code }: { code: string }) => {
  const [html, setHtml] = useState('');

  useEffect(() => {
    codeToHtml(code, {
      lang: 'tsx',
      theme: 'github-dark',
    }).then(setHtml);
  }, [code]);

  return (
    <details className={classes.details} open>
      <summary className={classes.summary}>View Source</summary>
      {html ? (
        <div
          className={classes.codeWrapper}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className={classes.fallback}>
          <code>{code}</code>
        </pre>
      )}
    </details>
  );
};
