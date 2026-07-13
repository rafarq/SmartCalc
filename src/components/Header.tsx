import { useRef } from 'react';
import type { DocumentModel } from '../state/document';
import { importSyscalc } from '../state/storage';
import { EditableTitle } from './EditableTitle';
import { useTheme } from '../hooks/useTheme';
import {
  CalendarIcon,
  HelpIcon,
  LoadIcon,
  MoonIcon,
  SaveIcon,
  SunIcon,
  TrashIcon,
  UndoIcon,
  RedoIcon,
} from './icons';

type Props = {
  title: string;
  onTitleChange: (next: string) => void;
  onSave: () => void;
  onLoad: (doc: DocumentModel) => void;
  onClear: () => void;
  onHelp: () => void;
  onCalendar: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

export function Header({
  title,
  onTitleChange,
  onSave,
  onLoad,
  onClear,
  onHelp,
  onCalendar,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: Props) {
  const { theme, toggle } = useTheme();
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
      <div className="header-brand-controls">
        <img className="header-brand-logo" src="/SmartCalc-logo.png" alt="SmartCalc" />
        <div className="history-actions" role="group" aria-label="Historial de cambios">
          <button
            type="button"
            className="icon-btn"
            onClick={onUndo}
            disabled={!canUndo}
            title="Deshacer (Ctrl/Cmd+Z)"
            aria-label="Deshacer"
          >
            <UndoIcon />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={onRedo}
            disabled={!canRedo}
            title="Rehacer (Ctrl/Cmd+Y)"
            aria-label="Rehacer"
          >
            <RedoIcon />
          </button>
        </div>
      </div>
      <EditableTitle value={title} onChange={onTitleChange} />
      <input
        ref={fileRef}
        type="file"
        accept=".syscalc,.json,application/json"
        hidden
        onChange={handleFileChange}
      />
      <div className="header-actions">
        <button
          className="icon-btn"
          onClick={(e) => toggle({ clientX: e.clientX, clientY: e.clientY })}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
        <button
          className="icon-btn"
          onClick={onCalendar}
          title="Calendario laboral por ciudad"
          aria-label="Calendario laboral"
        >
          <CalendarIcon />
        </button>
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
