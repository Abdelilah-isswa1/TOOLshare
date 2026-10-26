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