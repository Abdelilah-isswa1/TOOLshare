const User = require("../models/User");

const findByEmail = (email) =>
  User.findOne({ email: email.toLowerCase().trim() }).select("+password");

const findById = (id) => User.findById(id);

const create = async (data) => {
  const doc = await User.create(data);
  const { password, ...safe } = doc.toObject();
  return safe;
};
const findByIdWithPassword = (id) => User.findById(id).select("+password");

const emailTakenByOther = async (email, excludeId) =>
  !!(await User.exists({
    email: email.toLowerCase().trim(),
    _id: { $ne: excludeId },
  }));

const updateById = (id, data) =>
  User.findByIdAndUpdate(id, data, { new: true, runValidators: true });

module.exports = {
  findByEmail,
  findById,
  create,
  findByIdWithPassword,
  emailTakenByOther,
  updateById,
};

