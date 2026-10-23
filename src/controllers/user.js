const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/user.service');


const create = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body, req.user);
  res.status(201).json({ success: true, data: { user } });
});

const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  res.status(200).json({ success: true, data: { user } });
});