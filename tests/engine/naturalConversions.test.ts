import { describe, it, expect } from 'vitest';
import { tryNaturalConversion } from '../../src/engine/naturalConversions';

const ev = (s: string) => tryNaturalConversion(s);

describe('conversiones naturales — tiempo', () => {
  it('12 horas en minutos = 720', () => {
    const r = ev('12 horas en minutos');
    expect(r?.value).toBe(720);
    expect(r?.unit).toBe('minutos');
  });

  it('1 día en horas = 24', () => {
    const r = ev('1 día en horas');
    expect(r?.value).toBe(24);
    expect(r?.unit).toBe('horas');
  });

  it('minutos en 4 días = 5760', () => {
    const r = ev('minutos en 4 días');
    expect(r?.value).toBe(5760);
    expect(r?.unit).toBe('minutos');
  });

  it('segundos en 2 horas = 7200', () => {
    const r = ev('segundos en 2 horas');
    expect(r?.value).toBe(7200);
  });
});

describe('conversiones naturales — días en mes', () => {
  it('días en febrero de 2020 = 29 (bisiesto)', () => {
    const r = ev('días en febrero de 2020');
    expect(r?.value).toBe(29);
    expect(r?.unit).toBe('días');
  });

  it('días en febrero de 2021 = 28', () => {
    const r = ev('días en febrero de 2021');
    expect(r?.value).toBe(28);
  });

  it('días en enero de 2024 = 31', () => {
    const r = ev('días en enero de 2024');
    expect(r?.value).toBe(31);
  });

  it('días en abril de 2024 = 30', () => {
    const r = ev('días en abril de 2024');
    expect(r?.value).toBe(30);
  });

  it('dias sin acento también funciona', () => {
    const r = ev('dias en marzo de 2024');
    expect(r?.value).toBe(31);
  });
});

describe('conversiones naturales — no aplica', () => {
  it('null para mes desconocido', () => {
    expect(ev('días en parchís de 2024')).toBeNull();
  });
  it('null para texto sin estructura', () => {
    expect(ev('hola mundo')).toBeNull();
  });
});
