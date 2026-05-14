import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutocomplete } from '../../src/hooks/useAutocomplete';

describe('useAutocomplete', () => {
  it('sin trigger, lista vacía', () => {
    const { result } = renderHook(() => useAutocomplete(''));
    expect(result.current.suggestions).toEqual([]);
  });
  it('"area." muestra fórmulas de área', () => {
    const { result } = renderHook(() => useAutocomplete('area.'));
    expect(result.current.suggestions.length).toBeGreaterThan(0);
    expect(result.current.suggestions.every((s) => s.startsWith('area.'))).toBe(true);
  });
  it('"area.c" filtra a circulo y cuadrado', () => {
    const { result } = renderHook(() => useAutocomplete('area.c'));
    expect(result.current.suggestions.length).toBeGreaterThan(0);
    expect(result.current.suggestions.every((s) => s.startsWith('area.c'))).toBe(true);
  });
  it('"volumen." muestra fórmulas de volumen', () => {
    const { result } = renderHook(() => useAutocomplete('volumen.'));
    expect(result.current.suggestions.every((s) => s.startsWith('volumen.'))).toBe(true);
  });
  it('"perímetro." con acento funciona igual que "perimetro."', () => {
    const { result } = renderHook(() => useAutocomplete('perímetro.'));
    expect(result.current.suggestions.every((s) => s.startsWith('perimetro.'))).toBe(true);
  });
  it('navegación cíclica con ↑↓', () => {
    const { result } = renderHook(() => useAutocomplete('area.'));
    const len = result.current.suggestions.length;
    expect(result.current.selectedIndex).toBe(0);
    act(() => result.current.moveDown());
    expect(result.current.selectedIndex).toBe(1);
    act(() => result.current.moveUp());
    expect(result.current.selectedIndex).toBe(0);
    act(() => result.current.moveUp());
    expect(result.current.selectedIndex).toBe(len - 1);
  });
});
