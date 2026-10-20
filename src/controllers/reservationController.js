const asyncHandler = require('../utils/asyncHandler');
const reservationService = require('../services/reservationService');

exports.create = asyncHandler(async (req, res) => {
  const reservation = await reservationService.createReservation(req.user.id, req.body || {});
  res.status(201).json({ reservation });
});

exports.availability = asyncHandler(async (req, res) => {
  const { equipmentId, startDate, durationHours } = req.query;
  const result = await reservationService.checkAvailability({
    equipmentId,
    startDate,
    durationHours: durationHours === undefined ? undefined : Number(durationHours),
  });
  res.json(result);
});
