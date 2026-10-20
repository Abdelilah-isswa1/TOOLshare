const express = require('express');

const router = express.Router();

router.use('/installation', require('./installation.routes'));

module.exports = router;
