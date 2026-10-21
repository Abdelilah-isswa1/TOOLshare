const mongoose = require('mongoose');
const config = require('./config');

// Connects to MongoDB and waits until every model's indexes are built.
// This matters for TOOL-33: the unique partial index on reservations is what
// guarantees no double booking, so we must not serve traffic before it exists.
async function connect(uri = config.mongoUri) {
  await mongoose.connect(uri);
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
  return mongoose.connection;
}

async function disconnect() {
  await mongoose.disconnect();
}

module.exports = { connect, disconnect };
