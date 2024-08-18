const express = require('express');
const router = express.Router();
const cookieAuthMW = require('../middleware/cookie-auth');
const { updateUser, deleteUser, getUserForUpdate } = require('../controllers/prot');

/* 
I'm planning for these to have athentication in the cookie
*/
router.put('/user/:id', cookieAuthMW, updateUser);
router.delete('/user/:id', cookieAuthMW, deleteUser);
router.get('/prot/getuser/:id', cookieAuthMW, getUserForUpdate);

module.exports = router;