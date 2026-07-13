import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Editor } from './components/Editor';
import { HelpPage } from './components/HelpPage';
import { HolidaysCalendar } from './components/HolidaysCalendar';
import { useDocument } from './hooks/useDocument';
import { exportSyscalc } from './state/storage';
import './styles/global.css';
import './styles/app.css';

export default function App() {
  const [helpOpen, setHelpOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const docState = useDocument();
  const { doc, replaceDocument, clearDocument, setTitle, ...editorProps } = docState;

  useEffect(() => {
    const handleHistoryShortcut = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea')) return;

      const key = event.key.toLowerCase();
      const isUndo = key === 'z' && !event.shiftKey;
      const isRedo = key === 'y' || (key === 'z' && event.shiftKey);
      if (!isUndo && !isRedo) return;

      event.preventDefault();
      if (isUndo) docState.undo();
      else docState.redo();
    };

    window.addEventListener('keydown', handleHistoryShortcut);
    return () => window.removeEventListener('keydown', handleHistoryShortcut);
  }, [docState.undo, docState.redo]);

  const hasContent = doc.lines.some((l) => l.text.trim().length > 0);

  const handleClear = () => {
    if (hasContent && !window.confirm('¿Limpiar la hoja? Se perderán las líneas actuales.')) {
      return;
    }
    clearDocument();
  };

  return (
    <div className="app">
      <Header
        title={doc.title}
        onTitleChange={setTitle}
        onSave={() => exportSyscalc(doc)}
        onLoad={(loaded) => replaceDocument(loaded)}
        onClear={handleClear}
        onHelp={() => setHelpOpen(true)}
        onCalendar={() => setCalendarOpen(true)}
        onUndo={docState.undo}
        onRedo={docState.redo}
        canUndo={docState.canUndo}
        canRedo={docState.canRedo}
      />
      <Editor doc={doc} {...editorProps} />
      <footer className="app-footer">
        <div>
          Herramienta abierta creada por{' '}
          <a
            href="https://www.systemarquitectura.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            System Arquitectura
          </a>
          .
        </div>
        <div>
          Repositorio de codigo abierto en{' '}
          <a
            href="https://github.com/rafarq/SmartCalc"
            target="_blank"
            rel="noopener noreferrer"
          >
            rafarq/SmartCalc
          </a>
          .
        </div>
      </footer>
      {helpOpen && <HelpPage onClose={() => setHelpOpen(false)} />}
      {calendarOpen && <HolidaysCalendar onClose={() => setCalendarOpen(false)} />}
    </div>
  );
}
