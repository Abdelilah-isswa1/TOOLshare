# ToolShare API

Backend for a tool/equipment reservation platform (Node.js, Express, MongoDB/Mongoose).
This repository contains **Abdelilah's part** of the project: installation, stores,
manager assignment, catalog, and the whole reservation flow. Authentication, models,
equipment, handover and return are Khalid's tasks (see [Stubs](#stubs-to-replace)).

## Requirements

- Node.js 18+
- MongoDB **6.0 or newer** (the reservation index uses `$in` in a partial filter, supported from 6.0)

## Configuration

Copy `.env.example` to `.env` and adjust:

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | HTTP port |
| `MONGO_URI` | `mongodb://localhost:27017/toolshare` | MongoDB connection string |
| `JWT_SECRET` | `change-me-in-production` | Secret used to verify JWTs. **Change it.** |

Never commit `.env`.

## Launch

```bash
npm install
cp .env.example .env
npm start            # or: npm run dev   (auto-reload)
```

The server connects to MongoDB and builds all indexes **before** it starts listening.
If MongoDB is not reachable it exits with an error.

- Swagger UI: `http://localhost:3000/api-docs` (raw spec: `/api-docs.json`)
- Health check: `GET /api/health`

Docker Compose (backend + MongoDB) is part of Khalid's tasks; once it is merged, `docker compose up --build` starts everything.

## First-run installation

Until the system is installed there is no admin, so the installation endpoint is public:

```bash
curl http://localhost:3000/api/installation/status
# {"installed":false}

curl -X POST http://localhost:3000/api/installation \
  -H 'Content-Type: application/json' \
  -d '{"name":"Root Admin","email":"admin@example.com","password":"a-long-password"}'
# 201 {"installed":true,"admin":{...}}
```

Any further call returns `409 ALREADY_INSTALLED`, even if two calls are made at the same moment.

## Endpoints (my part)

| Method & path | Role | Task |
|---|---|---|
| `GET /api/installation/status`, `POST /api/installation` | public (until installed) | TOOL-20 |
| `GET/POST /api/stores`, `GET/PUT /api/stores/:id`, `PATCH /api/stores/:id/deactivate` | admin | TOOL-24 |
| `PUT /api/managers/:userId/store` | admin | TOOL-26 |
| `GET /api/catalog/stores` | any authenticated | TOOL-30 |
| `POST /api/reservations` | user | TOOL-32/33/34 |
| `GET /api/reservations/availability?equipmentId&startDate&durationHours` | any authenticated | TOOL-35 |
| `PATCH /api/reservations/:id/cancel` | user (owner) | TOOL-36 |
| `GET /api/me/reservations`, `/api/me/loans`, `/api/me/history` | user | TOOL-37 |

Errors are always JSON: `{ "error": { "code", "message" } }` with 400 validation, 401 unauthenticated,
403 forbidden, 404 not found, 409 conflict.

## How double booking is prevented (TOOL-33)

Each reservation stores the 30-minute slots it covers (`occupiedSlots`). A **unique partial index** on
`(equipment, occupiedSlots)`, limited to `confirmed` and `in_progress` reservations, makes the insert itself
the atomic check: if any slot is already taken, MongoDB rejects the insert and the API answers `409`. No
check-then-insert race, no transaction needed. The overlap query in the service is only a fast path for a
friendly error. Cancelling a reservation moves it out of the index filter, which frees its slots instantly.

## Tests

```bash
npm run test:unit          # no database needed: rules, overlaps, cancellation, transitions
npm run test:integration   # API + concurrency tests, uses an in-memory MongoDB
npm test                   # everything
```

The integration tests use `mongodb-memory-server`, which downloads a MongoDB binary the first time
(needs internet, can take a minute). `tests/integration/concurrency.test.js` fires simultaneous
requests at the same slot and asserts that exactly one succeeds (TOOL-44).

## Assumptions

- Slots are 30 minutes in UTC: `startDate` must be on a `:00` or `:30` boundary and `durationHours` a multiple of 0.5. This keeps the slot buckets exactly equal to the real interval.
- Maximum duration is 168 hours (7 days), so a request cannot generate an unbounded number of slots.
- Booking and cancelling are for the `user` role; availability and the catalog are open to every authenticated role.
- A non-owner cancelling someone else's reservation gets `403`.
- `/api/me/reservations` = confirmed, `/api/me/loans` = in progress, `/api/me/history` = returned or cancelled (newest first).
- Installation requires a valid email and a password of at least 8 characters.
- The user id always comes from the JWT, never from the request body.

## Stubs to replace

Marked with `// STUB - replaced by Khalid's TOOL-xx`. Delete or replace them when his branches are merged:

- `src/models/User.js`, `Store.js`, `Equipment.js`, `Reservation.js` (TOOL-17/18). Keep the reservation index and the fields `occupiedSlots`, `startDate`, `endDate`, `status`, `reference` in the real model.
- `src/middlewares/authenticate.js`, `authorizeRoles.js`, `storeScope.js` (TOOL-23). The JWT payload must be `{ sub, role, storeId }`.
- `src/middlewares/errorHandler.js` and `src/utils/AppError.js` (TOOL-19).

My own model, `src/models/Installation.js`, is not a stub.
