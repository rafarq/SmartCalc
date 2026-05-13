import { useEffect, useRef } from 'react';

type Props = {
  value: string;
  result: string;
  autoFocus?: boolean;
  onChange: (text: string) => void;
  onEnter: () => void;
};

export function LineRow({ value, result, autoFocus, onChange, onEnter }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  return (
    <div className="line-row">
      <input
        ref={inputRef}
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
