const express = require('express');

const router = express.Router();

router.use('/installation', require('./installation.routes'));

router.use('/stores', require('./store.routes'));

router.use('/managers', require('./manager.routes'));

router.use('/catalog', require('./catalog.routes'));

module.exports = router;
