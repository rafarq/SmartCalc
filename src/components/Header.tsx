type Props = { onSave: () => void; onLoad: () => void; onHelp: () => void };

export function Header({ onSave, onLoad, onHelp }: Props) {
  return (
    <header className="header">
      <h1 className="header-title">SmartCalc</h1>
      <div className="header-actions">
        <button onClick={onHelp} title="Ayuda" aria-label="Ayuda">
          ?
        </button>
        <button onClick={onLoad}>Cargar</button>
        <button onClick={onSave}>Guardar</button>
      </div>
    </header>
  );
}
