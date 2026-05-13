import { useState } from 'react';
import { Header } from './components/Header';
import { Editor } from './components/Editor';
import { HelpPage } from './components/HelpPage';
import './styles/global.css';
import './styles/app.css';

export default function App() {
  const [helpOpen, setHelpOpen] = useState(false);
  return (
    <div className="app">
      <Header onSave={() => {}} onLoad={() => {}} onHelp={() => setHelpOpen(true)} />
      <Editor />
      {helpOpen && <HelpPage onClose={() => setHelpOpen(false)} />}
    </div>
  );
}
