import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeViewerProps {
  data: any;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);
  const formatted = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-container">
      <button
        onClick={handleCopy}
        className="btn-secondary copy-btn-floating"
        title="Copiar JSON al portapapeles"
      >
        {copied ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
        <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
      </button>

      <pre style={{ margin: 0, color: '#38bdf8' }}>
        <code>{formatted}</code>
      </pre>
    </div>
  );
};
