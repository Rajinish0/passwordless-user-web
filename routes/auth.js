const express = require('express');
const router = express.Router();

const { 
    register, 
    login,
    verify,
    reqVerify,
    update
 } = require('../controllers/auth');

/*
The token, where required, for these is specified in the URL
*/

router.post('/register', register);
router.post('/login', login);
router.get('/verify/:token', verify);
router.get('/req-verify/:id', reqVerify);
router.get('/update/:token', update);

module.exports = router;