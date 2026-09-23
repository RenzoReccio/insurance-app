import React, { useState, useEffect } from 'react';
import { EndorsePayload } from '../api/endorse.api';
import { AlertCircle } from 'lucide-react';

interface JsonEditorProps {
  payload: EndorsePayload;
  onChange: (updated: EndorsePayload) => void;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({ payload, onChange }) => {
  const [text, setText] = useState(() => JSON.stringify(payload, null, 2));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setText(JSON.stringify(payload, null, 2));
    setError(null);
  }, [payload]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);

    try {
      const parsed = JSON.parse(val);
      setError(null);
      onChange(parsed);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <textarea
        className="json-editor-textarea"
        value={text}
        onChange={handleTextChange}
        spellCheck={false}
        placeholder="{ ... }"
      />
      {error && (
        <div
          style={{
            marginTop: '8px',
            fontSize: '12px',
            color: '#f87171',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <AlertCircle size={14} />
          Error de sintaxis JSON: {error}
        </div>
      )}
    </div>
  );
};
