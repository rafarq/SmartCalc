import { useState } from 'react';
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
      />
      <Editor doc={doc} {...editorProps} />
      <footer className="app-footer">
        Herramienta abierta creada por{' '}
        <a
          href="https://www.systemarquitectura.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          System Arquitectura
        </a>
        .
      </footer>
      {helpOpen && <HelpPage onClose={() => setHelpOpen(false)} />}
      {calendarOpen && <HolidaysCalendar onClose={() => setCalendarOpen(false)} />}
    </div>
  );
}
