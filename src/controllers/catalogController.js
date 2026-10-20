const asyncHandler = require('../utils/asyncHandler');
const catalogService = require('../services/catalogService');

exports.listStores = asyncHandler(async (req, res) => {
  const stores = await catalogService.listActiveStoresWithEquipment();
  res.json({ stores });
});
