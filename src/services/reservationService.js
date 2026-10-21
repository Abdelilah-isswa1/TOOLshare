const AppError = require('../utils/AppError');
const {
  MAX_DURATION_HOURS,
  isSlotAligned,
  isWholeSlotDuration,
  computeEndDate,
  computeSlots,
  intervalsOverlap,
} = require('../utils/timeSlots');
const { generateReference } = require('../utils/reference');
const storeRepository = require('../repositories/storeRepository');
const equipmentRepository = require('../repositories/equipmentRepository');
const reservationRepository = require('../repositories/reservationRepository');

// Allowed status transitions. Cancel (TOOL-36) is ours; handover
// (confirmed -> in_progress) and return (in_progress -> returned) belong to
// Khalid's tasks and are only declared here so the rules live in one place.
const ALLOWED_TRANSITIONS = {
  confirmed: ['cancelled'],
  in_progress: ['returned'],
  returned: [],
  cancelled: [],
};

function canTransition(from, to) {
  return (ALLOWED_TRANSITIONS[from] || []).includes(to);
}

// Pure time rules shared by booking and availability (TOOL-32).
function parseSlot({ startDate, durationHours }, now = Date.now()) {
  if (typeof durationHours !== 'number' || !Number.isFinite(durationHours) || durationHours <= 0) {
    throw new AppError(400, 'durationHours must be a positive number');
  }
  if (durationHours > MAX_DURATION_HOURS) {
    throw new AppError(400, `durationHours cannot exceed ${MAX_DURATION_HOURS}`);
  }
  if (!isWholeSlotDuration(durationHours)) {
    throw new AppError(400, 'durationHours must be a multiple of 0.5');
  }
  if (!startDate) throw new AppError(400, 'startDate is required');
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) throw new AppError(400, 'startDate must be a valid date');
  if (start.getTime() <= now) throw new AppError(400, 'startDate cannot be in the past');
  if (!isSlotAligned(start)) {
    throw new AppError(400, 'startDate must be on a 30-minute boundary (e.g. 10:00 or 10:30)');
  }
  const end = computeEndDate(start, durationHours);
  return { start, end, slots: computeSlots(start, end) };
}

// TOOL-32 booking rules: end = start + duration, duration > 0, start not in
// the past, equipment must belong to the store and be available.
async function validateBookingInput({ storeId, equipmentId, startDate, durationHours }, now = Date.now()) {
  if (!storeId || !equipmentId) throw new AppError(400, 'storeId and equipmentId are required');
  const { start, end, slots } = parseSlot({ startDate, durationHours }, now);

  const store = await storeRepository.findById(storeId);
  if (!store || !store.active) throw new AppError(404, 'store not found');

  const equipment = await equipmentRepository.findById(equipmentId);
  if (!equipment || String(equipment.store) !== String(storeId)) {
    throw new AppError(400, 'equipment does not belong to the chosen store');
  }
  if (equipment.status !== 'available') {
    throw new AppError(409, 'equipment is not available', 'EQUIPMENT_UNAVAILABLE');
  }
  return { start, end, slots, store, equipment };
}

const MAX_REFERENCE_ATTEMPTS = 5;

// TOOL-33 + TOOL-34: create a reservation. The overlap query is only a fast
// path for a friendly error; the unique partial index on occupiedSlots is the
// real guarantee that two simultaneous requests cannot both win.
async function createReservation(userId, input, now = Date.now()) {
  const { start, end, slots, equipment } = await validateBookingInput(input, now);

  const conflicts = await reservationRepository.findOverlapping(equipment._id, start, end);
  if (conflicts.length > 0) {
    throw new AppError(409, 'the requested time slot is no longer available', 'SLOT_TAKEN');
  }

  for (let attempt = 0; attempt < MAX_REFERENCE_ATTEMPTS; attempt += 1) {
    try {
      return await reservationRepository.create({
        reference: generateReference(),
        user: userId,
        store: input.storeId,
        equipment: equipment._id,
        startDate: start,
        endDate: end,
        durationHours: input.durationHours,
        occupiedSlots: slots,
        status: 'confirmed',
      });
    } catch (err) {
      if (!err.referenceCollision) throw err; // slot conflicts and others bubble up
    }
  }
  throw new AppError(500, 'could not generate a unique reservation reference', 'INTERNAL_ERROR');
}

// TOOL-35: is this equipment free for this slot?
async function checkAvailability({ equipmentId, startDate, durationHours }, now = Date.now()) {
  if (!equipmentId) throw new AppError(400, 'equipmentId is required');
  const { start, end } = parseSlot({ startDate, durationHours }, now);

  const equipment = await equipmentRepository.findById(equipmentId);
  if (!equipment) throw new AppError(404, 'equipment not found');

  const base = { equipmentId: String(equipment._id), startDate: start, endDate: end };
  const store = await storeRepository.findById(equipment.store);
  if (!store || !store.active) return { ...base, available: false, reason: 'STORE_INACTIVE' };
  if (equipment.status !== 'available') return { ...base, available: false, reason: 'EQUIPMENT_UNAVAILABLE' };

  const conflicts = await reservationRepository.findOverlapping(equipment._id, start, end);
  if (conflicts.length > 0) return { ...base, available: false, reason: 'SLOT_TAKEN' };
  return { ...base, available: true };
}

// TOOL-36: cancel a confirmed reservation before its start (owner only).
async function cancelReservation(userId, reservationId, now = new Date()) {
  const reservation = await reservationRepository.findById(reservationId);
  if (!reservation) throw new AppError(404, 'reservation not found');
  if (String(reservation.user) !== String(userId)) {
    throw new AppError(403, 'forbidden: not your reservation');
  }
  if (!canTransition(reservation.status, 'cancelled')) {
    throw new AppError(409, 'only confirmed reservations can be cancelled', 'INVALID_STATUS');
  }
  if (reservation.startDate <= now) {
    throw new AppError(409, 'a reservation that has started cannot be cancelled', 'ALREADY_STARTED');
  }
  const updated = await reservationRepository.cancelIfConfirmed(reservationId, userId, now);
  if (!updated) throw new AppError(409, 'reservation can no longer be cancelled', 'INVALID_STATUS');
  return updated; // its slots are free again: the unique index ignores cancelled bookings
}

// TOOL-37: ownership is enforced by always filtering on the caller's id.
const listMyReservations = (userId) =>
  reservationRepository.findByUser(userId, { status: 'confirmed' }, { startDate: 1 });
const listMyLoans = (userId) =>
  reservationRepository.findByUser(userId, { status: 'in_progress' }, { startDate: 1 });
const listMyHistory = (userId) =>
  reservationRepository.findByUser(userId, { status: { $in: ['returned', 'cancelled'] } }, { startDate: -1 });

module.exports = {
  ALLOWED_TRANSITIONS,
  canTransition,
  parseSlot,
  validateBookingInput,
  createReservation,
  checkAvailability,
  cancelReservation,
  listMyReservations,
  listMyLoans,
  listMyHistory,
  intervalsOverlap,
};
