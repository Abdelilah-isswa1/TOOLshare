const mongoose = require('mongoose');

// STUB - replaced by Khalid's TOOL-17/18
const equipmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    status: { type: String, enum: ['available', 'unavailable', 'retired'], default: 'available' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Equipment', equipmentSchema);
