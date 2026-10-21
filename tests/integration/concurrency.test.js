// TOOL-44: concurrency tests. The unique partial index on
// (equipment, occupiedSlots) must let exactly one of N simultaneous requests win.
const request = require('supertest');
const app = require('../../src/app');
const { startDb, clearDb, stopDb } = require('../helpers/db');
const { bearer, futureSlot } = require('../helpers/auth');
const User = require('../../src/models/User');
const Store = require('../../src/models/Store');
const Equipment = require('../../src/models/Equipment');
const Reservation = require('../../src/models/Reservation');

let store;
let drill;
let users;

const book = (who, hour, durationHours) =>
  request(app)
    .post('/api/reservations')
    .set('Authorization', bearer(who))
    .send({
      storeId: String(store._id),
      equipmentId: String(drill._id),
      startDate: futureSlot(2, hour).toISOString(),
      durationHours,
    });

const statuses = (results) => results.map((r) => r.status).sort();

beforeAll(startDb);
afterAll(stopDb);

beforeEach(async () => {
  await clearDb();
  store = await Store.create({ name: 'Main', address: 'x' });
  drill = await Equipment.create({ name: 'Drill', store: store._id });
  users = await Promise.all(
    Array.from({ length: 8 }, (_, i) => User.create({ name: `U${i}`, email: `u${i}@t.io`, password: 'x', role: 'user' }))
  );
});

test('index exists and is a partial unique index', async () => {
  const indexes = await Reservation.collection.indexes();
  const slotIndex = indexes.find((i) => i.key.occupiedSlots === 1);
  expect(slotIndex.unique).toBe(true);
  expect(slotIndex.partialFilterExpression).toBeDefined();
});

test('two simultaneous requests for the same slot: exactly one succeeds', async () => {
  const results = await Promise.all([book(users[0], 10, 2), book(users[1], 10, 2)]);
  expect(statuses(results)).toEqual([201, 409]);
  expect(await Reservation.countDocuments({ equipment: drill._id, status: 'confirmed' })).toBe(1);
});

test('eight simultaneous requests for the same slot: exactly one succeeds', async () => {
  const results = await Promise.all(users.map((u) => book(u, 10, 2)));
  expect(results.filter((r) => r.status === 201)).toHaveLength(1);
  expect(results.filter((r) => r.status === 409)).toHaveLength(7);
  expect(await Reservation.countDocuments({ equipment: drill._id })).toBe(1);
});

test('simultaneous partially overlapping requests: exactly one succeeds', async () => {
  const results = await Promise.all([book(users[0], 10, 2), book(users[1], 11, 2)]); // 10-12 vs 11-13
  expect(statuses(results)).toEqual([201, 409]);
});

test('simultaneous adjacent requests both succeed', async () => {
  const results = await Promise.all([book(users[0], 10, 1), book(users[1], 11, 1)]); // 10-11 vs 11-12
  expect(statuses(results)).toEqual([201, 201]);
});

test('the same slot on different equipment does not conflict', async () => {
  const saw = await Equipment.create({ name: 'Saw', store: store._id });
  const bookSaw = request(app)
    .post('/api/reservations')
    .set('Authorization', bearer(users[1]))
    .send({ storeId: String(store._id), equipmentId: String(saw._id), startDate: futureSlot(2, 10).toISOString(), durationHours: 2 });
  const results = await Promise.all([book(users[0], 10, 2), bookSaw]);
  expect(statuses(results)).toEqual([201, 201]);
});
