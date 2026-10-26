const express = require('express');
const router = express.Router();

router.use('/users', require('./user.routes'));
router.use('/auth', require('./auth'));
router.use('/equipment', require('./equipment.routes'));

module.exports = router;