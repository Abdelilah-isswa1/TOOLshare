const mongoose = require('mongoose');

// STUB - replaced by Khalid's TOOL-17/18
const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    address: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual populated by the catalog endpoint so stores can carry their equipment.
storeSchema.virtual('equipment', {
  ref: 'Equipment',
  localField: '_id',
  foreignField: 'store',
});

module.exports = mongoose.model('Store', storeSchema);
