const jwt = require('jsonwebtoken');
const config = require('../../src/config');

// Same payload shape the authenticate middleware reads (sub, role, storeId).
function tokenFor(user) {
  return jwt.sign(
    { sub: String(user._id), role: user.role, storeId: user.store ? String(user.store) : null },
    config.jwtSecret
  );
}

const bearer = (user) => `Bearer ${tokenFor(user)}`;

// A UTC slot-aligned start date `daysAhead` days from now at `hour`:`minute`.
function futureSlot(daysAhead = 2, hour = 10, minute = 0) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysAhead);
  d.setUTCHours(hour, minute, 0, 0);
  return d;
}

module.exports = { tokenFor, bearer, futureSlot };
