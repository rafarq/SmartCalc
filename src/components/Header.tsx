type Props = { onSave: () => void; onLoad: () => void };

export function Header({ onSave, onLoad }: Props) {
  return (
    <header className="header">
      <h1 className="header-title">SmartCalc</h1>
      <div className="header-actions">
        <button onClick={onLoad}>Cargar</button>
        <button onClick={onSave}>Guardar</button>
      </div>
    </header>
  );
}
