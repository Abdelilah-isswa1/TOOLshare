const request = require('supertest');
const app = require('../../src/app');
const { startDb, clearDb, stopDb } = require('../helpers/db');
const { bearer, futureSlot } = require('../helpers/auth');
const User = require('../../src/models/User');
const Store = require('../../src/models/Store');
const Equipment = require('../../src/models/Equipment');
const Reservation = require('../../src/models/Reservation');

let admin;
let manager;
let user;
let other;
let store;
let drill;

const adminAuth = () => bearer(admin);
const book = (who, over = {}) =>
  request(app)
    .post('/api/reservations')
    .set('Authorization', bearer(who))
    .send({
      storeId: String(store._id),
      equipmentId: String(drill._id),
      startDate: futureSlot(2, 10).toISOString(),
      durationHours: 2,
      ...over,
    });

beforeAll(startDb);
afterAll(stopDb);

beforeEach(async () => {
  await clearDb();
  admin = await User.create({ name: 'Admin', email: 'admin@t.io', password: 'x', role: 'admin' });
  user = await User.create({ name: 'User', email: 'user@t.io', password: 'x', role: 'user' });
  other = await User.create({ name: 'Other', email: 'other@t.io', password: 'x', role: 'user' });
  store = await Store.create({ name: 'Main store', address: '1 Rue Test' });
  manager = await User.create({ name: 'Mgr', email: 'mgr@t.io', password: 'x', role: 'manager', store: store._id });
  drill = await Equipment.create({ name: 'Drill', store: store._id });
});

describe('TOOL-20 installation', () => {
  beforeEach(() => User.deleteMany({}));

  test('status is false before installation, true after, and a second install gets 409', async () => {
    expect((await request(app).get('/api/installation/status')).body).toEqual({ installed: false });
    const body = { name: 'Root', email: 'root@t.io', password: 'longenough1' };
    const first = await request(app).post('/api/installation').send(body);
    expect(first.status).toBe(201);
    expect(first.body.admin.role).toBe('admin');
    expect(first.body.admin.password).toBeUndefined();
    expect((await request(app).get('/api/installation/status')).body).toEqual({ installed: true });
    const second = await request(app).post('/api/installation').send({ ...body, email: 'root2@t.io' });
    expect(second.status).toBe(409);
  });

  test('validates input', async () => {
    const res = await request(app).post('/api/installation').send({ name: 'x', email: 'bad', password: 'short' });
    expect(res.status).toBe(400);
  });

  test('two simultaneous installs create exactly one admin', async () => {
    const mk = (n) => request(app).post('/api/installation').send({ name: 'R', email: `r${n}@t.io`, password: 'longenough1' });
    const results = await Promise.all([mk(1), mk(2), mk(3)]);
    expect(results.filter((r) => r.status === 201)).toHaveLength(1);
    expect(await User.countDocuments({ role: 'admin' })).toBe(1);
  });
});

describe('TOOL-24 stores', () => {
  test('admin full lifecycle, others forbidden', async () => {
    const created = await request(app).post('/api/stores').set('Authorization', adminAuth())
      .send({ name: 'Annex', address: '2 Rue Test' });
    expect(created.status).toBe(201);
    const id = created.body.store._id;
    expect((await request(app).post('/api/stores').set('Authorization', adminAuth())
      .send({ name: 'Annex', address: 'dup' })).status).toBe(409);
    expect((await request(app).put(`/api/stores/${id}`).set('Authorization', adminAuth())
      .send({ address: 'New address' })).body.store.address).toBe('New address');
    const deactivated = await request(app).patch(`/api/stores/${id}/deactivate`).set('Authorization', adminAuth());
    expect(deactivated.body.store.active).toBe(false);
    expect((await request(app).get('/api/stores')).status).toBe(401);
    expect((await request(app).get('/api/stores').set('Authorization', bearer(user))).status).toBe(403);
    expect((await request(app).get('/api/stores/not-an-id').set('Authorization', adminAuth())).status).toBe(400);
  });
});

describe('TOOL-26 manager store assignment', () => {
  test('assigns a store, never leaks the password hash, rejects bad targets', async () => {
    const annex = await Store.create({ name: 'Annex', address: 'x' });
    const ok = await request(app).put(`/api/managers/${manager._id}/store`).set('Authorization', adminAuth())
      .send({ storeId: String(annex._id) });
    expect(ok.status).toBe(200);
    expect(String(ok.body.manager.store)).toBe(String(annex._id));
    expect(ok.body.manager.password).toBeUndefined();
    expect((await request(app).put(`/api/managers/${user._id}/store`).set('Authorization', adminAuth())
      .send({ storeId: String(annex._id) })).status).toBe(400); // not a manager
    await Store.findByIdAndUpdate(annex._id, { active: false });
    expect((await request(app).put(`/api/managers/${manager._id}/store`).set('Authorization', adminAuth())
      .send({ storeId: String(annex._id) })).status).toBe(409); // inactive store
    expect((await request(app).put(`/api/managers/${manager._id}/store`).set('Authorization', bearer(manager))
      .send({ storeId: String(annex._id) })).status).toBe(403); // admin only
  });
});

describe('TOOL-30 catalog', () => {
  test('lists active stores with their non-retired equipment', async () => {
    await Equipment.create({ name: 'Old saw', store: store._id, status: 'retired' });
    await Store.create({ name: 'Closed', address: 'x', active: false });
    const res = await request(app).get('/api/catalog/stores').set('Authorization', bearer(user));
    expect(res.status).toBe(200);
    expect(res.body.stores).toHaveLength(1);
    expect(res.body.stores[0].equipment.map((e) => e.name)).toEqual(['Drill']);
    expect((await request(app).get('/api/catalog/stores')).status).toBe(401);
  });
});

describe('TOOL-34 POST /reservations', () => {
  test('creates a confirmed reservation with a unique reference', async () => {
    const res = await book(user);
    expect(res.status).toBe(201);
    expect(res.body.reservation.reference).toMatch(/^TS-[A-Z0-9]{6}$/);
    expect(res.body.reservation.status).toBe('confirmed');
    expect(String(res.body.reservation.user)).toBe(String(user._id)); // from the token, not the body
    expect(new Date(res.body.reservation.endDate).getTime() - new Date(res.body.reservation.startDate).getTime())
      .toBe(2 * 3600 * 1000);
  });

  test('ignores a user id sent in the body', async () => {
    const res = await book(user, { user: String(other._id) });
    expect(String(res.body.reservation.user)).toBe(String(user._id));
  });

  test('validation and permission errors', async () => {
    expect((await book(user, { durationHours: 0 })).status).toBe(400);
    expect((await book(user, { startDate: '2000-01-01T10:00:00Z' })).status).toBe(400);
    expect((await book(user, { startDate: futureSlot(2, 10, 15).toISOString() })).status).toBe(400);
    expect((await book(user, { equipmentId: String(new Equipment()._id) })).status).toBe(400);
    expect((await request(app).post('/api/reservations').send({})).status).toBe(401);
    expect((await book(manager)).status).toBe(403);
    await Equipment.findByIdAndUpdate(drill._id, { status: 'unavailable' });
    expect((await book(user)).status).toBe(409);
  });

  test('overlapping booking gets 409, adjacent booking is accepted', async () => {
    expect((await book(user)).status).toBe(201); // 10:00-12:00
    expect((await book(other, { startDate: futureSlot(2, 11).toISOString() })).status).toBe(409);
    expect((await book(other, { startDate: futureSlot(2, 12).toISOString() })).status).toBe(201);
  });
});

describe('TOOL-35 availability', () => {
  const check = (q) => request(app).get('/api/reservations/availability').set('Authorization', bearer(user)).query(q);
  const q = (over = {}) => ({
    equipmentId: String(drill._id),
    startDate: futureSlot(2, 10).toISOString(),
    durationHours: 2,
    ...over,
  });

  test('free then taken', async () => {
    expect((await check(q())).body.available).toBe(true);
    await book(other);
    expect((await check(q())).body).toMatchObject({ available: false, reason: 'SLOT_TAKEN' });
    expect((await check(q({ startDate: futureSlot(2, 12).toISOString() }))).body.available).toBe(true);
  });

  test('errors', async () => {
    expect((await check(q({ equipmentId: undefined }))).status).toBe(400);
    expect((await check(q({ durationHours: 'abc' }))).status).toBe(400);
    expect((await check(q({ equipmentId: String(new Equipment()._id) }))).status).toBe(404);
  });
});

describe('TOOL-36 cancel', () => {
  test('owner cancels, slot is released, others cannot cancel it', async () => {
    const { reservation } = (await book(user)).body;
    const url = `/api/reservations/${reservation._id}/cancel`;
    expect((await request(app).patch(url).set('Authorization', bearer(other))).status).toBe(403);
    const res = await request(app).patch(url).set('Authorization', bearer(user));
    expect(res.status).toBe(200);
    expect(res.body.reservation.status).toBe('cancelled');
    expect((await request(app).patch(url).set('Authorization', bearer(user))).status).toBe(409); // already cancelled
    expect((await book(other)).status).toBe(201); // slot is free again
  });

  test('cannot cancel after start or an unknown reservation', async () => {
    const started = await Reservation.create({
      reference: 'TS-STARTD', user: user._id, store: store._id, equipment: drill._id,
      startDate: new Date(Date.now() - 3600 * 1000), endDate: new Date(Date.now() + 3600 * 1000),
      durationHours: 2, occupiedSlots: ['x'], status: 'confirmed',
    });
    expect((await request(app).patch(`/api/reservations/${started._id}/cancel`)
      .set('Authorization', bearer(user))).status).toBe(409);
    expect((await request(app).patch(`/api/reservations/${new Reservation()._id}/cancel`)
      .set('Authorization', bearer(user))).status).toBe(404);
  });
});

describe('TOOL-37 my reservations, loans and history', () => {
  test('each user only ever sees their own data', async () => {
    const mine = (await book(user)).body.reservation;
    await book(other, { startDate: futureSlot(3, 10).toISOString() });
    const cancelled = (await book(user, { startDate: futureSlot(4, 10).toISOString() })).body.reservation;
    await request(app).patch(`/api/reservations/${cancelled._id}/cancel`).set('Authorization', bearer(user));
    await Reservation.create({
      reference: 'TS-LOAN01', user: user._id, store: store._id, equipment: drill._id,
      startDate: futureSlot(5, 10), endDate: futureSlot(5, 12), durationHours: 2,
      occupiedSlots: ['loan-slot'], status: 'in_progress',
    });

    const get = (path, who) => request(app).get(path).set('Authorization', bearer(who));
    const reservations = (await get('/api/me/reservations', user)).body.reservations;
    expect(reservations.map((r) => r._id)).toEqual([mine._id]);
    expect((await get('/api/me/loans', user)).body.loans.map((l) => l.reference)).toEqual(['TS-LOAN01']);
    expect((await get('/api/me/history', user)).body.history.map((h) => h._id)).toEqual([cancelled._id]);
    expect((await get('/api/me/reservations', other)).body.reservations).toHaveLength(1);
    expect((await get('/api/me/loans', other)).body.loans).toHaveLength(0);
    expect((await request(app).get('/api/me/history')).status).toBe(401);
    expect((await get('/api/me/history', manager)).status).toBe(403);
  });
});

describe('misc', () => {
  test('malformed JSON gets 400, unknown route 404, docs are served', async () => {
    expect((await request(app).post('/api/installation').set('Content-Type', 'application/json').send('{bad')).status).toBe(400);
    expect((await request(app).get('/api/nope')).status).toBe(404);
    const spec = await request(app).get('/api-docs.json');
    expect(Object.keys(spec.body.paths)).toContain('/api/reservations');
  });
});
