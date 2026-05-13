import { useState } from 'react';
import { Header } from './components/Header';
import { Editor } from './components/Editor';
import { HelpPage } from './components/HelpPage';
import { useDocument } from './hooks/useDocument';
import { exportSyscalc } from './state/storage';
import './styles/global.css';
import './styles/app.css';

export default function App() {
  const [helpOpen, setHelpOpen] = useState(false);
  const docState = useDocument();
  const { doc, replaceDocument, ...editorProps } = docState;

  return (
    <div className="app">
      <Header
        onSave={() => exportSyscalc(doc)}
        onLoad={(loaded) => replaceDocument(loaded)}
        onHelp={() => setHelpOpen(true)}
      />
      <Editor doc={doc} {...editorProps} />
      {helpOpen && <HelpPage onClose={() => setHelpOpen(false)} />}
    </div>
  );
}
