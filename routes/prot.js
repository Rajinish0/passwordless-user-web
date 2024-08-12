const express = require('express');
const router = express.Router();
const { updateUser, deleteUser } = require('../controllers/prot');

router.put('/update/:id', updateUser);
router.delete('/delete/:id', deleteUser);

module.exports = router;