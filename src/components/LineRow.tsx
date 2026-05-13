type Props = {
  value: string;
  result: string;
  onChange: (text: string) => void;
  onEnter: () => void;
};

export function LineRow({ value, result, onChange, onEnter }: Props) {
  return (
    <div className="line-row">
      <input
        className="line-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onEnter();
          }
        }}
      />
      <span className="line-result">{result}</span>
    </div>
  );
}
