const asyncHandler = require('../utils/asyncHandler');
const managerService = require('../services/managerService');

exports.assignStore = asyncHandler(async (req, res) => {
  const manager = await managerService.assignStore(req.params.userId, (req.body || {}).storeId);
  res.json({ manager });
});
