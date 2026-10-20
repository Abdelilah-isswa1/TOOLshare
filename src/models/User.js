const mongoose = require('mongoose');

// STUB - replaced by Khalid's TOOL-17/18
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'manager', 'user'], default: 'user' },
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', default: null },
  },
  {
    timestamps: true,
    // Never serialize the password hash, whichever endpoint returns a user.
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('User', userSchema);
