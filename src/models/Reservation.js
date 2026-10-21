const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    durationHours: { type: Number, required: true },
    occupiedSlots: { type: [String], required: true },
    status: {
      type: String,
      enum: ['confirmed', 'in_progress', 'returned', 'cancelled'],
      default: 'confirmed',
      index: true,
    },
  },
  { timestamps: true }
);

/*
 * TOOL-33: Concurrency strategy.
 * We model each reservation as the set of fixed time buckets (occupiedSlots,
 * 30-minute granularity) it covers, and put a UNIQUE compound index on
 * (equipment, occupiedSlots) restricted to active reservations via a partial
 * index. Inserting a reservation is therefore a single atomic conditional
 * write: if another request already booked any overlapping bucket, the insert
 * fails with DuplicateKeyError (code 11000) and we return 409 - exactly one of
 * two simultaneous requests wins, with no transactions and no check-then-act
 * race (the pre-check in the service is only a fast path; the index is the
 * source of truth). Cancelling flips the status out of the partial filter,
 * which automatically releases every bucket.
 */
reservationSchema.index(
  { equipment: 1, occupiedSlots: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['confirmed', 'in_progress'] } },
  }
);
reservationSchema.index({ equipment: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
