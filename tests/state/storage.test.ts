import { describe, it, expect, beforeEach } from 'vitest';
import { saveLocal, loadLocal } from '../../src/state/storage';
import { DEFAULT_TITLE } from '../../src/state/document';

beforeEach(() => localStorage.clear());

describe('storage', () => {
  it('round-trip de un documento con título', () => {
    const doc = {
      title: 'Mi hoja',
      lines: [{ id: '1', text: 'a' }, { id: '2', text: 'b' }],
    };
    saveLocal(doc);
    expect(loadLocal()).toEqual(doc);
  });

  it('devuelve null si no hay nada guardado', () => {
    expect(loadLocal()).toBeNull();
  });

  it('devuelve null si el contenido es inválido', () => {
    localStorage.setItem('smartcalc:doc', 'not json');
    expect(loadLocal()).toBeNull();
  });

  it('rechaza estructuras que no son DocumentModel', () => {
    localStorage.setItem('smartcalc:doc', JSON.stringify({ foo: 'bar' }));
    expect(loadLocal()).toBeNull();
  });

  it('docs antiguos sin title reciben el título por defecto', () => {
    localStorage.setItem('smartcalc:doc', JSON.stringify({ lines: [{ id: '1', text: 'x' }] }));
    expect(loadLocal()).toEqual({ title: DEFAULT_TITLE, lines: [{ id: '1', text: 'x' }] });
  });
});
