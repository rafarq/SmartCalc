import type { Suggestion } from '../hooks/useAutocomplete';

type Props = {
  items: Suggestion[];
  selectedIndex: number;
  onPick: (s: Suggestion) => void;
};

export function Autocomplete({ items, selectedIndex, onPick }: Props) {
  if (items.length === 0) return null;
  return (
    <ul className="autocomplete" role="listbox">
      {items.map((s, i) => (
        <li
          key={s.text}
          role="option"
          aria-selected={i === selectedIndex}
          className={i === selectedIndex ? 'autocomplete-item selected' : 'autocomplete-item'}
          onMouseDown={(e) => {
            e.preventDefault();
            onPick(s);
          }}
        >
          <code className="autocomplete-label">{s.label}</code>
          {s.description && <span className="autocomplete-desc">{s.description}</span>}
        </li>
      ))}
    </ul>
  );
}
