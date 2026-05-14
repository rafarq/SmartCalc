import { useRef } from 'react';
import type { DocumentModel } from '../state/document';
import { importSyscalc } from '../state/storage';
import { EditableTitle } from './EditableTitle';
import { HelpIcon, LoadIcon, SaveIcon, TrashIcon } from './icons';

type Props = {
  title: string;
  onTitleChange: (next: string) => void;
  onSave: () => void;
  onLoad: (doc: DocumentModel) => void;
  onClear: () => void;
  onHelp: () => void;
};

export function Header({ title, onTitleChange, onSave, onLoad, onClear, onHelp }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const doc = await importSyscalc(f);
      onLoad(doc);
    } catch (err) {
      alert(`No se pudo cargar el archivo: ${(err as Error).message}`);
    }
    e.target.value = '';
  };

  return (
    <header className="header">
      <img className="header-brand-logo" src="/SmartCalc-logo.png" alt="SmartCalc" />
      <EditableTitle value={title} onChange={onTitleChange} />
      <input
        ref={fileRef}
        type="file"
        accept=".syscalc,.json,application/json"
        hidden
        onChange={handleFileChange}
      />
      <div className="header-actions">
        <button className="icon-btn" onClick={onHelp} title="Ayuda" aria-label="Ayuda">
          <HelpIcon />
        </button>
        <button
          className="icon-btn"
          onClick={onClear}
          title="Limpiar hoja (empezar de cero)"
          aria-label="Limpiar hoja"
        >
          <TrashIcon />
        </button>
        <button
          className="icon-btn"
          onClick={() => fileRef.current?.click()}
          title="Cargar archivo .syscalc"
          aria-label="Cargar"
        >
          <LoadIcon />
        </button>
        <button
          className="icon-btn"
          onClick={onSave}
          title="Guardar como .syscalc"
          aria-label="Guardar"
        >
          <SaveIcon />
        </button>
      </div>
    </header>
  );
}
