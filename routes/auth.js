const express = require('express');
const router = express.Router();

const { 
    register, 
    login,
    verify,
    reqVerify
 } = require('../controllers/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/verify/:token', verify);
router.get('/req-verify/:id', reqVerify);

module.exports = router;