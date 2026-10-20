const express = require('express');

const router = express.Router();

router.use('/installation', require('./installation.routes'));

router.use('/stores', require('./store.routes'));

router.use('/managers', require('./manager.routes'));

router.use('/catalog', require('./catalog.routes'));

router.use('/reservations', require('./reservation.routes'));

router.use('/me', require('./me.routes'));

module.exports = router;
