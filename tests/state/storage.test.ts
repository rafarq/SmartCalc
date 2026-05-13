import { describe, it, expect, beforeEach } from 'vitest';
import { saveLocal, loadLocal } from '../../src/state/storage';

beforeEach(() => localStorage.clear());

describe('storage', () => {
  it('round-trip de un documento', () => {
    const doc = { lines: [{ id: '1', text: 'a' }, { id: '2', text: 'b' }] };
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
});
