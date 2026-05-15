import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutocomplete } from '../../src/hooks/useAutocomplete';

describe('useAutocomplete — geometría', () => {
  it('sin trigger, lista vacía', () => {
    const { result } = renderHook(() => useAutocomplete(''));
    expect(result.current.suggestions).toEqual([]);
  });
  it('"area." muestra fórmulas de área', () => {
    const { result } = renderHook(() => useAutocomplete('area.'));
    expect(result.current.suggestions.length).toBeGreaterThan(0);
    expect(result.current.suggestions.every((s) => s.text.startsWith('area.'))).toBe(true);
    expect(result.current.suggestions[0].replaceFrom).toBe(0);
  });
  it('"area.c" filtra a circulo y cuadrado', () => {
    const { result } = renderHook(() => useAutocomplete('area.c'));
    expect(result.current.suggestions.length).toBeGreaterThan(0);
    expect(result.current.suggestions.every((s) => s.text.startsWith('area.c'))).toBe(true);
  });
  it('"volumen." muestra fórmulas de volumen', () => {
    const { result } = renderHook(() => useAutocomplete('volumen.'));
    expect(result.current.suggestions.every((s) => s.text.startsWith('volumen.'))).toBe(true);
  });
  it('"perímetro." con acento funciona igual que "perimetro."', () => {
    const { result } = renderHook(() => useAutocomplete('perímetro.'));
    expect(result.current.suggestions.every((s) => s.text.startsWith('perimetro.'))).toBe(true);
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

describe('useAutocomplete — propiedades de perfil', () => {
  it('"IPN100." sugiere todas las propiedades del perfil', () => {
    const { result } = renderHook(() => useAutocomplete('IPN100.'));
    expect(result.current.suggestions.length).toBeGreaterThan(5);
    const labels = result.current.suggestions.map((s) => s.label);
    expect(labels).toContain('h');
    expect(labels).toContain('b');
    expect(labels).toContain('p');
  });
  it('"IPN100.h" filtra solo lo que empieza por h', () => {
    const { result } = renderHook(() => useAutocomplete('IPN100.h'));
    expect(result.current.suggestions.every((s) => s.label.startsWith('h'))).toBe(true);
  });
  it('el text completo incluye el perfil + propiedad', () => {
    const { result } = renderHook(() => useAutocomplete('IPN100.h'));
    const first = result.current.suggestions.find((s) => s.label === 'h');
    expect(first?.text).toBe('IPN100.h');
  });
  it('replaceFrom respeta el prefijo en expresiones', () => {
    const { result } = renderHook(() => useAutocomplete('2 + HEA150.'));
    const first = result.current.suggestions[0];
    expect(first.replaceFrom).toBe('2 + '.length);
    expect(first.text.startsWith('HEA150.')).toBe(true);
  });
  it('perfil inexistente no produce sugerencias', () => {
    const { result } = renderHook(() => useAutocomplete('XYZ999.'));
    expect(result.current.suggestions).toEqual([]);
  });
});
