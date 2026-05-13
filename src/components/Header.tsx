import { useRef } from 'react';
import type { DocumentModel } from '../state/document';
import { importSyscalc } from '../state/storage';
import { HelpIcon, LoadIcon, SaveIcon } from './icons';

type Props = {
  onSave: () => void;
  onLoad: (doc: DocumentModel) => void;
  onHelp: () => void;
};

export function Header({ onSave, onLoad, onHelp }: Props) {
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
    // Resetea el valor para que cargar el mismo archivo dos veces dispare onChange.
    e.target.value = '';
  };

  return (
    <header className="header">
      <h1 className="header-title">SmartCalc</h1>
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
