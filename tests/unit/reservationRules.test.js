jest.mock('../../src/repositories/storeRepository');
jest.mock('../../src/repositories/equipmentRepository');
jest.mock('../../src/repositories/reservationRepository');

const storeRepository = require('../../src/repositories/storeRepository');
const equipmentRepository = require('../../src/repositories/equipmentRepository');
const reservationRepository = require('../../src/repositories/reservationRepository');
const service = require('../../src/services/reservationService');

const NOW = Date.UTC(2030, 0, 1, 8, 0); // fixed "now"
const START = '2030-01-02T10:00:00.000Z'; // aligned, in the future
const input = (over = {}) => ({
  storeId: 'store1',
  equipmentId: 'eq1',
  startDate: START,
  durationHours: 2,
  ...over,
});

beforeEach(() => {
  jest.resetAllMocks();
  storeRepository.findById.mockResolvedValue({ _id: 'store1', active: true });
  equipmentRepository.findById.mockResolvedValue({ _id: 'eq1', store: 'store1', status: 'available' });
  reservationRepository.findOverlapping.mockResolvedValue([]);
});

const rejects = async (promise, status) => {
  await expect(promise).rejects.toMatchObject({ statusCode: status });
};

describe('TOOL-32 booking rules', () => {
  test('valid input computes end = start + duration', async () => {
    const r = await service.validateBookingInput(input(), NOW);
    expect(r.end.toISOString()).toBe('2030-01-02T12:00:00.000Z');
    expect(r.slots).toHaveLength(4);
  });

  test.each([0, -1, 'abc', undefined, NaN])('rejects duration %p', (d) =>
    rejects(service.validateBookingInput(input({ durationHours: d }), NOW), 400));

  test('rejects a start date in the past', () =>
    rejects(service.validateBookingInput(input({ startDate: '2029-12-31T10:00:00Z' }), NOW), 400));

  test('rejects a start that is not on a 30-minute boundary', () =>
    rejects(service.validateBookingInput(input({ startDate: '2030-01-02T10:10:00Z' }), NOW), 400));

  test('rejects a duration over the maximum', () =>
    rejects(service.validateBookingInput(input({ durationHours: 1000 }), NOW), 400));

  test('rejects equipment from another store', async () => {
    equipmentRepository.findById.mockResolvedValue({ _id: 'eq1', store: 'otherStore', status: 'available' });
    await rejects(service.validateBookingInput(input(), NOW), 400);
  });

  test('rejects unavailable equipment', async () => {
    equipmentRepository.findById.mockResolvedValue({ _id: 'eq1', store: 'store1', status: 'unavailable' });
    await rejects(service.validateBookingInput(input(), NOW), 409);
  });

  test('rejects an inactive or unknown store', async () => {
    storeRepository.findById.mockResolvedValue({ _id: 'store1', active: false });
    await rejects(service.validateBookingInput(input(), NOW), 404);
  });
});

describe('creation', () => {
  test('fails with 409 when the fast-path overlap check finds a conflict', async () => {
    reservationRepository.findOverlapping.mockResolvedValue([{ _id: 'x' }]);
    await rejects(service.createReservation('u1', input(), NOW), 409);
    expect(reservationRepository.create).not.toHaveBeenCalled();
  });

  test('retries when the generated reference collides', async () => {
    const collision = Object.assign(new Error('dup'), { referenceCollision: true });
    reservationRepository.create.mockRejectedValueOnce(collision).mockResolvedValueOnce({ reference: 'TS-OK' });
    const created = await service.createReservation('u1', input(), NOW);
    expect(created.reference).toBe('TS-OK');
    expect(reservationRepository.create).toHaveBeenCalledTimes(2);
  });

  test('a slot conflict from the index is not retried', async () => {
    const slotTaken = Object.assign(new Error('taken'), { statusCode: 409 });
    reservationRepository.create.mockRejectedValue(slotTaken);
    await rejects(service.createReservation('u1', input(), NOW), 409);
    expect(reservationRepository.create).toHaveBeenCalledTimes(1);
  });
});

describe('TOOL-42 cancellation', () => {
  const future = new Date(Date.now() + 24 * 3600 * 1000);
  const reservation = (over = {}) => ({ _id: 'r1', user: 'u1', status: 'confirmed', startDate: future, ...over });

  test('owner can cancel a confirmed reservation that has not started', async () => {
    reservationRepository.findById.mockResolvedValue(reservation());
    reservationRepository.cancelIfConfirmed.mockResolvedValue({ status: 'cancelled' });
    await expect(service.cancelReservation('u1', 'r1')).resolves.toMatchObject({ status: 'cancelled' });
  });

  test('404 when the reservation does not exist', async () => {
    reservationRepository.findById.mockResolvedValue(null);
    await rejects(service.cancelReservation('u1', 'r1'), 404);
  });

  test('403 when the caller is not the owner', async () => {
    reservationRepository.findById.mockResolvedValue(reservation({ user: 'someoneElse' }));
    await rejects(service.cancelReservation('u1', 'r1'), 403);
  });

  test.each(['in_progress', 'returned', 'cancelled'])('409 when status is %s', async (status) => {
    reservationRepository.findById.mockResolvedValue(reservation({ status }));
    await rejects(service.cancelReservation('u1', 'r1'), 409);
  });

  test('409 once the reservation has started', async () => {
    reservationRepository.findById.mockResolvedValue(reservation({ startDate: new Date(Date.now() - 1000) }));
    await rejects(service.cancelReservation('u1', 'r1'), 409);
  });

  test('409 when a concurrent change wins the atomic update', async () => {
    reservationRepository.findById.mockResolvedValue(reservation());
    reservationRepository.cancelIfConfirmed.mockResolvedValue(null);
    await rejects(service.cancelReservation('u1', 'r1'), 409);
  });
});

describe('TOOL-42 status transitions', () => {
  // Only confirmed -> cancelled is ours; handover (confirmed -> in_progress) is
  // Khalid's endpoint, so it is intentionally not allowed through cancel rules.
  test.each([
    ['confirmed', 'cancelled', true],
    ['confirmed', 'in_progress', false],
    ['in_progress', 'returned', true],
    ['in_progress', 'cancelled', false],
    ['returned', 'cancelled', false],
    ['cancelled', 'confirmed', false],
  ])('%s -> %s allowed: %p', (from, to, ok) => {
    expect(service.canTransition(from, to)).toBe(ok);
  });
});

describe('availability', () => {
  test('free slot', async () => {
    const r = await service.checkAvailability({ equipmentId: 'eq1', startDate: START, durationHours: 1 }, NOW);
    expect(r.available).toBe(true);
  });

  test('slot taken', async () => {
    reservationRepository.findOverlapping.mockResolvedValue([{}]);
    const r = await service.checkAvailability({ equipmentId: 'eq1', startDate: START, durationHours: 1 }, NOW);
    expect(r).toMatchObject({ available: false, reason: 'SLOT_TAKEN' });
  });

  test('unavailable equipment', async () => {
    equipmentRepository.findById.mockResolvedValue({ _id: 'eq1', store: 'store1', status: 'unavailable' });
    const r = await service.checkAvailability({ equipmentId: 'eq1', startDate: START, durationHours: 1 }, NOW);
    expect(r).toMatchObject({ available: false, reason: 'EQUIPMENT_UNAVAILABLE' });
  });

  test('unknown equipment is a 404', async () => {
    equipmentRepository.findById.mockResolvedValue(null);
    await rejects(service.checkAvailability({ equipmentId: 'nope', startDate: START, durationHours: 1 }, NOW), 404);
  });
});
