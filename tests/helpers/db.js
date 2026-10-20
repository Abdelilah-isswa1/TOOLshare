const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let server;

async function startDb() {
  server = await MongoMemoryServer.create();
  await mongoose.connect(server.getUri());
  // Build indexes (incl. the unique partial index) before any test runs.
  await Promise.all(Object.values(mongoose.models).map((m) => m.init()));
}

async function clearDb() {
  await Promise.all(Object.values(mongoose.connection.collections).map((c) => c.deleteMany({})));
}

async function stopDb() {
  await mongoose.disconnect();
  if (server) await server.stop();
}

module.exports = { startDb, clearDb, stopDb };
