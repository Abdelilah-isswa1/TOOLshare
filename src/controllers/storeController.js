const asyncHandler = require('../utils/asyncHandler');
const storeService = require('../services/storeService');

exports.list = asyncHandler(async (req, res) => res.json({ stores: await storeService.listStores() }));
exports.get = asyncHandler(async (req, res) => res.json({ store: await storeService.getStore(req.params.storeId) }));
exports.create = asyncHandler(async (req, res) => res.status(201).json({ store: await storeService.createStore(req.body || {}) }));
exports.update = asyncHandler(async (req, res) => res.json({ store: await storeService.updateStore(req.params.storeId, req.body || {}) }));
exports.deactivate = asyncHandler(async (req, res) => res.json({ store: await storeService.deactivateStore(req.params.storeId) }));
