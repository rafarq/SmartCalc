import { useEffect, useRef, useState } from 'react';
import { DEFAULT_TITLE } from '../state/document';

type Props = {
  value: string;
  onChange: (next: string) => void;
};

export function EditableTitle({ value, onChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    onChange(trimmed || DEFAULT_TITLE);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const startEditing = () => {
    setDraft(value || DEFAULT_TITLE);
    setEditing(true);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="doc-title doc-title-input"
        aria-label="Título de la hoja"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            cancel();
          }
        }}
        spellCheck={false}
      />
    );
  }

  return (
    <button
      type="button"
      className="doc-title"
      onPointerDown={(e) => {
        e.preventDefault();
        startEditing();
      }}
      onClick={startEditing}
      title="Click para renombrar"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          startEditing();
        }
      }}
    >
      {value || DEFAULT_TITLE}
    </button>
  );
}
