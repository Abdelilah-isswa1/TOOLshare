# Jira task -> files

Suggested commit order (one commit per task, message `TOOL-<n>: <description>`).

| Task | Files |
|---|---|
| TOOL-20 | `routes/installation.routes.js`, `controllers/installationController.js`, `services/installationService.js`, `repositories/installationRepository.js`, `models/Installation.js` |
| TOOL-24 | `routes/store.routes.js`, `controllers/storeController.js`, `services/storeService.js`, `repositories/storeRepository.js` |
| TOOL-26 | `routes/manager.routes.js`, `controllers/managerController.js`, `services/managerService.js`, `repositories/managerRepository.js` |
| TOOL-30 | `routes/catalog.routes.js`, `controllers/catalogController.js`, `services/catalogService.js`, `repositories/catalogRepository.js` |
| TOOL-32 | `utils/timeSlots.js`, `utils/reference.js`, `services/reservationService.js` (`parseSlot`, `validateBookingInput`) |
| TOOL-33 | `models/Reservation.js` (index), `repositories/reservationRepository.js` (`create`, `findOverlapping`), `services/reservationService.js` (`createReservation`) |
| TOOL-34 | `routes/reservation.routes.js` (POST), `controllers/reservationController.js` (`create`) |
| TOOL-35 | `reservationService.checkAvailability`, `reservation.routes.js` (GET availability) |
| TOOL-36 | `reservationService.cancelReservation`, `reservationRepository.cancelIfConfirmed`, `reservation.routes.js` (PATCH cancel) |
| TOOL-37 | `routes/me.routes.js`, `controllers/meController.js`, `reservationService.listMy*` |
| TOOL-42 | `tests/unit/*`, `tests/integration/api.test.js` |
| TOOL-44 | `tests/integration/concurrency.test.js`, `tests/helpers/*` |
| TOOL-46 | `README.md`, `.env.example` |
| TOOL-48 | Final fixes and cross-review |

Shared files (`src/app.js`, `src/routes/index.js`, `package.json`, `src/server.js`, `src/db.js`, `src/swagger.js`) mix several tasks:
stage them with `git add -p` as described in the Git workflow.
