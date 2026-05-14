type Props = {
  items: string[];
  selectedIndex: number;
  onPick: (s: string) => void;
};

export function Autocomplete({ items, selectedIndex, onPick }: Props) {
  if (items.length === 0) return null;
  return (
    <ul className="autocomplete" role="listbox">
      {items.map((s, i) => (
        <li
          key={s}
          role="option"
          aria-selected={i === selectedIndex}
          className={i === selectedIndex ? 'autocomplete-item selected' : 'autocomplete-item'}
          onMouseDown={(e) => {
            e.preventDefault();
            onPick(s);
          }}
        >
          <code>{s}</code>
        </li>
      ))}
    </ul>
  );
}
