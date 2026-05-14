import { describe, it, expect } from 'vitest';
import Holidays from 'date-holidays';

describe('date-holidays smoke', () => {
  it('1 enero 2026 es festivo nacional en ES', () => {
    const hd = new Holidays('ES');
    const isHoliday = hd.isHoliday(new Date(2026, 0, 1));
    expect(isHoliday).toBeTruthy();
  });
});
