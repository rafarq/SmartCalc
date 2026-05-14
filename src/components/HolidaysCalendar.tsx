import { useEffect, useMemo, useState } from 'react';
import { cityList, getCityHolidays, type Scope } from '../engine/holidaysList';
import { CloseIcon } from './icons';

type Props = { onClose: () => void };

const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
const DOW_NAMES = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const SCOPE_LABEL: Record<Scope, string> = {
  national: 'Nacional',
  regional: 'Autonómico',
  local: 'Local',
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// dayOfWeek con lunes=0 ... domingo=6 (calendario europeo).
function dowMonFirst(date: Date): number {
  return (date.getDay() + 6) % 7;
}

type MonthCell = { day: number; date: string; holiday?: { name: string; scope: Scope } };

function buildMonth(year: number, month: number, byDate: Map<string, { name: string; scope: Scope }>): (MonthCell | null)[] {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = dowMonFirst(first);
  const cells: (MonthCell | null)[] = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, date, holiday: byDate.get(date) });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function HolidaysCalendar({ onClose }: Props) {
  const cities = useMemo(() => cityList(), []);
  const currentYear = new Date().getFullYear();
  const [city, setCity] = useState<string>('madrid');
  const [year, setYear] = useState<number>(currentYear);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const data = useMemo(() => getCityHolidays(city, year), [city, year]);

  const byDate = useMemo(() => {
    const m = new Map<string, { name: string; scope: Scope }>();
    if (data) for (const h of data.holidays) m.set(h.date, { name: h.name, scope: h.scope });
    return m;
  }, [data]);

  const years: number[] = [];
  for (let y = currentYear - 1; y <= currentYear + 5; y++) years.push(y);

  return (
    <div className="help-page" role="dialog" aria-modal="true" aria-labelledby="cal-title">
      <header className="help-header">
        <h1 id="cal-title" className="help-title">Calendario laboral</h1>
        <button className="help-close" onClick={onClose} aria-label="Cerrar calendario">
          <CloseIcon size={20} />
        </button>
      </header>
      <div className="cal-content">
        <div className="cal-controls">
          <label className="cal-control">
            <span>Ciudad</span>
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              {cities.map((c) => (
                <option key={c} value={c}>{capitalize(c)}</option>
              ))}
            </select>
          </label>
          <label className="cal-control">
            <span>Año</span>
            <select value={year} onChange={(e) => setYear(parseInt(e.target.value, 10))}>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </label>
          <ul className="cal-legend" aria-label="Leyenda">
            <li><span className="cal-swatch national" /> Nacional</li>
            <li><span className="cal-swatch regional" /> Autonómico</li>
            <li><span className="cal-swatch local" /> Local</li>
          </ul>
        </div>
        <p className="cal-disclaimer">
          Los festivos locales se basan en patronales fijas bien conocidas; los
          ayuntamientos pueden alterarlos cada año. Para uso oficial, consulta
          el BOE y el BOP de tu provincia.
        </p>

        {!data ? (
          <p className="cal-empty">No se ha podido cargar el calendario.</p>
        ) : (
          <>
            <div className="cal-grid">
              {Array.from({ length: 12 }, (_, month) => {
                const cells = buildMonth(year, month, byDate);
                return (
                  <div className="cal-month" key={month}>
                    <h2 className="cal-month-title">{capitalize(MONTH_NAMES[month])}</h2>
                    <div className="cal-dow-row">
                      {DOW_NAMES.map((d) => (
                        <span key={d} className="cal-dow">{d}</span>
                      ))}
                    </div>
                    <div className="cal-days">
                      {cells.map((c, i) => {
                        if (!c) return <span key={i} className="cal-day empty" />;
                        const scope = c.holiday?.scope;
                        const className = `cal-day${scope ? ` ${scope}` : ''}`;
                        return (
                          <span
                            key={i}
                            className={className}
                            title={c.holiday ? `${c.holiday.name} · ${SCOPE_LABEL[c.holiday.scope]}` : undefined}
                          >
                            {c.day}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <section className="cal-list">
              <h2 className="cal-list-title">
                Festivos en {capitalize(city)} · {year}
                {!data.hasLocal && (
                  <span className="cal-list-note"> (sin festivos locales específicos)</span>
                )}
              </h2>
              <ul>
                {data.holidays.map((h) => (
                  <li key={`${h.date}-${h.name}`} className={`cal-list-item ${h.scope}`}>
                    <span className="cal-swatch" /> <strong>{h.date.split('-').reverse().join('/')}</strong>
                    <span className="cal-list-name">{h.name}</span>
                    <span className="cal-list-scope">{SCOPE_LABEL[h.scope]}</span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
        <footer className="help-footer">
          Pulsa <kbd>Esc</kbd> o el botón de cerrar para volver a la calculadora.
        </footer>
      </div>
    </div>
  );
}
