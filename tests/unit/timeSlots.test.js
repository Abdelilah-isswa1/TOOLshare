const {
  computeEndDate,
  intervalsOverlap,
  computeSlots,
  isSlotAligned,
  isWholeSlotDuration,
} = require('../../src/utils/timeSlots');

describe('TOOL-42 end date calculation', () => {
  test('end = start + duration', () => {
    const end = computeEndDate('2030-01-01T10:00:00.000Z', 2.5);
    expect(end.toISOString()).toBe('2030-01-01T12:30:00.000Z');
  });

  test('rejects zero, negative and non-numeric durations', () => {
    expect(() => computeEndDate('2030-01-01T10:00:00Z', 0)).toThrow();
    expect(() => computeEndDate('2030-01-01T10:00:00Z', -1)).toThrow();
    expect(() => computeEndDate('2030-01-01T10:00:00Z', '2')).toThrow();
  });

  test('rejects an invalid start date', () => {
    expect(() => computeEndDate('not-a-date', 1)).toThrow();
  });
});

describe('TOOL-42 overlap detection', () => {
  const at = (h, m = 0) => new Date(Date.UTC(2030, 0, 1, h, m));

  test('overlapping intervals', () => {
    expect(intervalsOverlap(at(10), at(12), at(11), at(13))).toBe(true);
    expect(intervalsOverlap(at(10), at(14), at(11), at(12))).toBe(true); // contained
    expect(intervalsOverlap(at(10), at(12), at(10), at(12))).toBe(true); // identical
  });

  test('adjacent intervals do not overlap (half-open)', () => {
    expect(intervalsOverlap(at(10), at(11), at(11), at(12))).toBe(false);
    expect(intervalsOverlap(at(12), at(13), at(10), at(12))).toBe(false);
  });

  test('disjoint intervals', () => {
    expect(intervalsOverlap(at(8), at(9), at(10), at(11))).toBe(false);
  });
});

describe('slot buckets (TOOL-33 index input)', () => {
  const start = new Date('2030-01-01T10:00:00Z');

  test('a 1.5h booking covers three 30-minute slots', () => {
    const slots = computeSlots(start, computeEndDate(start, 1.5));
    expect(slots).toEqual(['2030-01-01T10:00', '2030-01-01T10:30', '2030-01-01T11:00']);
  });

  test('adjacent bookings share no slot, overlapping ones do', () => {
    const a = computeSlots(start, computeEndDate(start, 1));
    const b = computeSlots(computeEndDate(start, 1), computeEndDate(start, 2));
    const c = computeSlots(computeEndDate(start, 0.5), computeEndDate(start, 1.5));
    expect(a.filter((s) => b.includes(s))).toHaveLength(0);
    expect(a.filter((s) => c.includes(s))).toHaveLength(1);
  });

  test('alignment helpers', () => {
    expect(isSlotAligned('2030-01-01T10:30:00Z')).toBe(true);
    expect(isSlotAligned('2030-01-01T10:15:00Z')).toBe(false);
    expect(isWholeSlotDuration(1.5)).toBe(true);
    expect(isWholeSlotDuration(0.25)).toBe(false);
  });
});
