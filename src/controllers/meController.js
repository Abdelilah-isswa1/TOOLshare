const asyncHandler = require('../utils/asyncHandler');
const reservationService = require('../services/reservationService');

exports.reservations = asyncHandler(async (req, res) =>
  res.json({ reservations: await reservationService.listMyReservations(req.user.id) }));

exports.loans = asyncHandler(async (req, res) =>
  res.json({ loans: await reservationService.listMyLoans(req.user.id) }));

exports.history = asyncHandler(async (req, res) =>
  res.json({ history: await reservationService.listMyHistory(req.user.id) }));
