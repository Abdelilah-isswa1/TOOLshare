const AppError = require('../utils/AppError');
const {
  MAX_DURATION_HOURS,
  isSlotAligned,
  isWholeSlotDuration,
  computeEndDate,
  computeSlots,
  intervalsOverlap,
} = require('../utils/timeSlots');
const storeRepository = require('../repositories/storeRepository');
const equipmentRepository = require('../repositories/equipmentRepository');

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

module.exports = { parseSlot, validateBookingInput };
