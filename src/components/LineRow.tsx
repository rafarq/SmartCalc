import { useEffect, useRef, useState } from 'react';
import { extractText, placeCursorAtEnd, renderTokensToHTML } from '../utils/refs';
import { useAutocomplete, type Suggestion } from '../hooks/useAutocomplete';
import { Autocomplete } from './Autocomplete';
import { CheckIcon, CopyIcon } from './icons';

type Props = {
  value: string;
  result: string;
  resultError?: string;
  lineNumber?: number;
  lineValues: Record<string, string>;
  varNames?: string[];
  autoFocus?: boolean;
  resultClickable?: boolean;
  onChange: (text: string) => void;
  onEnter: () => void;
  onShiftEnter?: () => void;
  onBackspaceEmpty?: () => void;
  onFocus?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onResultClick?: () => void;
};

export function LineRow({
  value,
  result,
  resultError,
  lineNumber,
  lineValues,
  varNames,
  autoFocus,
  resultClickable,
  onChange,
  onEnter,
  onShiftEnter,
  onBackspaceEmpty,
  onFocus,
  onArrowUp,
  onArrowDown,
  onResultClick,
}: Props) {
  const inputRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [copied, setCopied] = useState(false);
  const ac = useAutocomplete(value);
  const acVisible = isFocused && ac.suggestions.length > 0;

  const pickSuggestion = (s: Suggestion) => {
    // Sustituimos solo desde `replaceFrom` hasta el final, conservando el
    // prefijo (p. ej. "2 + " antes de "IPN100.h").
    const before = value.slice(0, s.replaceFrom);
    onChange(before + s.text);
    ac.reset();
  };

  const hasValue = result !== '' && result !== '—' && !resultError;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // navegadores sin clipboard API o sin permisos: ignoramos silenciosamente
    }
  };

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const focused = isFocused || document.activeElement === el;
    if (focused && extractText(el) === value) {
      // El usuario está escribiendo: no reescribir el HTML para preservar el cursor.
      // Solo refrescamos el texto mostrado en los chips existentes.
      el.querySelectorAll<HTMLElement>('.ref-chip').forEach((chip) => {
        const id = chip.dataset.ref;
        if (!id) return;
        const display = lineValues[id] ?? '?';
        if (chip.textContent !== display) chip.textContent = display;
      });
      return;
    }
    el.innerHTML = renderTokensToHTML(value, lineValues, varNames ?? []);
    if (focused || autoFocus) placeCursorAtEnd(el);
  }, [value, lineValues, varNames, autoFocus, isFocused]);

  useEffect(() => {
    const el = inputRef.current;
    if (!autoFocus || !el) return;
    // Si el elemento ya está enfocado (p. ej. el usuario acaba de hacer click en
    // medio del texto), respetamos su posición de cursor. Solo forzamos foco +
    // cursor al final cuando el cambio de foco viene de un evento programático
    // (Enter para crear línea, borrado, carga de documento…).
    if (document.activeElement === el) return;
    el.focus();
    placeCursorAtEnd(el);
  }, [autoFocus]);

  const handleInput = () => {
    const el = inputRef.current;
    if (!el) return;
    onChange(extractText(el));
  };

  return (
    <div
      className="line-row"
      onMouseDown={(e) => {
        const el = inputRef.current;
        if (!el) return;
        const target = e.target as HTMLElement;
        // Si el click ya cae dentro del editor o sobre el resultado (con su propio
        // handler), dejamos que el navegador o el handler específico haga su trabajo.
        if (el.contains(target) || target.closest('.line-result')) return;
        // En cualquier otra zona de la fila (número de línea, padding, hueco vacío)
        // redirigimos el foco al editor para que el usuario pueda editar siempre.
        e.preventDefault();
        el.focus();
        placeCursorAtEnd(el);
      }}
    >
      {lineNumber !== undefined && <span className="line-number">{lineNumber}</span>}
      <div className="line-input-wrap">
      <div
        ref={inputRef}
        className="line-input"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        spellCheck={false}
        onInput={handleInput}
        onMouseDown={() => {
          // Safety net: aseguramos que el documento conoce esta línea como activa
          // aunque el evento focus nativo no se dispare en algún flujo (chips,
          // selección previa en otra zona…).
          onFocus?.();
        }}
        onFocus={() => {
          setIsFocused(true);
          onFocus?.();
        }}
        onBlur={() => setIsFocused(false)}
        onKeyDown={(e) => {
          // Mientras el autocompletado de geometría esté abierto, las flechas
          // y Enter/Tab pertenecen al popup, no a la navegación entre líneas.
          if (acVisible) {
            if (e.key === 'ArrowDown') { e.preventDefault(); ac.moveDown(); return; }
            if (e.key === 'ArrowUp') { e.preventDefault(); ac.moveUp(); return; }
            if (e.key === 'Enter' || e.key === 'Tab') {
              e.preventDefault();
              pickSuggestion(ac.suggestions[ac.selectedIndex]);
              return;
            }
            if (e.key === 'Escape') { e.preventDefault(); ac.reset(); return; }
          }
          if (e.key === 'Enter' && e.shiftKey && onShiftEnter) {
            e.preventDefault();
            onShiftEnter();
            return;
          }
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onEnter();
            return;
          }
          if (e.key === 'ArrowUp' && onArrowUp) {
            e.preventDefault();
            onArrowUp();
            return;
          }
          if (e.key === 'ArrowDown' && onArrowDown) {
            e.preventDefault();
            onArrowDown();
            return;
          }
          if (e.key === 'Backspace') {
            const el = inputRef.current;
            if (el && extractText(el) === '' && onBackspaceEmpty) {
              e.preventDefault();
              onBackspaceEmpty();
            }
          }
        }}
      />
      {acVisible && (
        <Autocomplete
          items={ac.suggestions}
          selectedIndex={ac.selectedIndex}
          onPick={pickSuggestion}
        />
      )}
      </div>
      <div className="line-result-cell">
        {hasValue && (
          <button
            type="button"
            className={`line-copy-btn${copied ? ' copied' : ''}`}
            title={copied ? 'Copiado' : 'Copiar resultado'}
            aria-label={copied ? 'Copiado' : 'Copiar resultado'}
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleCopy}
          >
            {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
          </button>
        )}
        <span
          className={`line-result${resultClickable ? ' clickable' : ''}${resultError ? ' error' : ''}`}
          role={resultClickable ? 'button' : undefined}
          title={
            resultError ? resultError : resultClickable ? 'Click para insertar referencia' : undefined
          }
          onMouseDown={(e) => {
            if (!resultClickable) return;
            e.preventDefault();
            onResultClick?.();
          }}
        >
          {result}
        </span>
      </div>
    </div>
  );
}
