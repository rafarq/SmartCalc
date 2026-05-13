import { HelpIcon, LoadIcon, SaveIcon } from './icons';

type Props = { onSave: () => void; onLoad: () => void; onHelp: () => void };

export function Header({ onSave, onLoad, onHelp }: Props) {
  return (
    <header className="header">
      <h1 className="header-title">SmartCalc</h1>
      <div className="header-actions">
        <button className="icon-btn" onClick={onHelp} title="Ayuda" aria-label="Ayuda">
          <HelpIcon />
        </button>
        <button className="icon-btn" onClick={onLoad} title="Cargar" aria-label="Cargar">
          <LoadIcon />
        </button>
        <button className="icon-btn" onClick={onSave} title="Guardar" aria-label="Guardar">
          <SaveIcon />
        </button>
      </div>
    </header>
  );
}
