const express = require('express');
const router = express.Router();
const cookieAuthMW = require('../middleware/cookie-auth');
const { updateUser } = require('../controllers/prot');

router.put('/:id', cookieAuthMW, updateUser);

module.exports = router;