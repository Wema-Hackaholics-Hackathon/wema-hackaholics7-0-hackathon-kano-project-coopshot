const express = require('express');
const { getMyPassport } = require('../controllers/passportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getMyPassport);

module.exports = router;
