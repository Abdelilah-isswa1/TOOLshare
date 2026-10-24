const Equipment = require('../models/Equipment');

const create = (data) => Equipment.create(data);
const findById = (id) => Equipment.findById(id);
const findByReference = (reference) => Equipment.findOne({ reference });

const updateById = (id, data) =>
  Equipment.findByIdAndUpdate(id, data, { new: true, runValidators: true });

const findAll = async (filter, { page = 1, limit = 10, sort = '-createdAt' } = {}) => {
  const [items, total] = await Promise.all([
    Equipment.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
    Equipment.countDocuments(filter),
  ]);