const express = require('express');
const router = express.Router();
const { updateUser, deleteUser } = require('../controllers/prot');

/*
The token for these is specified in the authorization parameter as "Bearer: " 
*/
router.put('/update/:id', updateUser);
router.delete('/delete/:id', deleteUser);

module.exports = router;