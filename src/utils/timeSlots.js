// TOOL-32/33 shared helpers for reservation time math.

const SLOT_MINUTES = 30;
const SLOT_MS = SLOT_MINUTES * 60 * 1000;
// Upper bound so one request can never generate an enormous list of slots.
const MAX_DURATION_HOURS = 24 * 7;

// A booking must start exactly on a slot boundary (e.g. 10:00 or 10:30 UTC),
// so the slot buckets match the real interval and adjacent bookings never clash.
function isSlotAligned(date) {
  return new Date(date).getTime() % SLOT_MS === 0;
}

// Duration must be a whole number of slots (multiple of 0.5 hour).
function isWholeSlotDuration(durationHours) {
  return Number.isInteger((durationHours * 60) / SLOT_MINUTES);
}

// End date = start + duration. Duration must be a positive number of hours.
function computeEndDate(startDate, durationHours) {
  if (typeof durationHours !== 'number' || Number.isNaN(durationHours) || durationHours <= 0) {
    throw new Error('durationHours must be a positive number');
  }
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) throw new Error('invalid startDate');
  return new Date(start.getTime() + durationHours * 60 * 60 * 1000);
}

// Standard half-open interval overlap test.
function intervalsOverlap(aStart, aEnd, bStart, bEnd) {
  return new Date(aStart) < new Date(bEnd) && new Date(aEnd) > new Date(bStart);
}

// Fixed UTC buckets (30 min) covered by [start, end). Used by the unique
// partial index for overlap-free, concurrency-safe inserts (TOOL-33).
function computeSlots(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (!(end > start)) return [];
  const slotMs = SLOT_MINUTES * 60 * 1000;
  const slots = [];
  let cursor = new Date(Math.floor(start.getTime() / slotMs) * slotMs);
  const last = new Date(Math.floor((end.getTime() - 1) / slotMs) * slotMs);
  while (cursor <= last) {
    slots.push(cursor.toISOString().slice(0, 16)); // YYYY-MM-DDTHH:MM
    cursor = new Date(cursor.getTime() + slotMs);
  }
  return slots;
}

module.exports = {
  SLOT_MINUTES,
  MAX_DURATION_HOURS,
  isSlotAligned,
  isWholeSlotDuration,
  computeEndDate,
  intervalsOverlap,
  computeSlots,
};
