const Equipment = require('../models/Equipment');

const create = (data) => Equipment.create(data);
const findById = (id) => Equipment.findById(id);
const findByReference = (reference) => Equipment.findOne({ reference });