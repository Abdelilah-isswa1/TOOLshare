const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/auth');

const login = asyncHandler(async (req, res) => {
    const data = await authService.login(req.body);
    res.status(200).json({ success: true, data });
});

const me = asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: { user: req.user } });
});

module.exports = { login, me };