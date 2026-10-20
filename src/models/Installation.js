const mongoose = require('mongoose');

// Single-document marker ("singleton") used to make first-run installation
// race-free: its fixed _id is unique, so only one concurrent install can create it.
const installationSchema = new mongoose.Schema(
  { _id: { type: String }, installedAt: { type: Date, default: Date.now } },
  { versionKey: false }
);

module.exports = mongoose.model('Installation', installationSchema);
