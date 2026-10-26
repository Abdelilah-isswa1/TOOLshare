const asyncHandler = require('../utils/asyncHandler');
const service = require('../services/equipment');

const create = asyncHandler(async (req, res) => {
  const equipment = await service.createEquipment(req.body, req.user);
  res.status(201).json({ success: true, data: { equipment } });
});

const list = asyncHandler(async (req, res) => {
  const { items, total, page, limit, pages } = await service.listEquipment(req.query, req.user);
  res.status(200).json({
    success: true,
    data: { equipment: items },
    pagination: { total, page, limit, pages },
  });
});

const getOne = asyncHandler(async (req, res) => {
  const equipment = await service.getEquipment(req.params.id, req.user);
  res.status(200).json({ success: true, data: { equipment } });
});

const update = asyncHandler(async (req, res) => {
  const equipment = await service.updateEquipment(req.params.id, req.body, req.user);
  res.status(200).json({ success: true, data: { equipment } });
});

const deactivate = asyncHandler(async (req, res) => {
  const equipment = await service.deactivateEquipment(req.params.id, req.user);
  res.status(200).json({ success: true, data: { equipment } });
});

const reactivate = asyncHandler(async (req, res) => {
  const equipment = await service.reactivateEquipment(req.params.id, req.user);
  res.status(200).json({ success: true, data: { equipment } });
});

module.exports = { create, list, getOne, update, deactivate, reactivate };