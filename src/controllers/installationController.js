const asyncHandler = require('../utils/asyncHandler');
const installationService = require('../services/installationService');

exports.getStatus = asyncHandler(async (req, res) => {
  const installed = await installationService.isInstalled();
  res.json({ installed });
});

exports.install = asyncHandler(async (req, res) => {
  const admin = await installationService.install(req.body || {});
  res.status(201).json({ installed: true, admin });
});
