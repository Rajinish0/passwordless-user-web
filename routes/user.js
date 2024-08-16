const express = require('express');

const router = express.Router();
const {
    getAllUsers,
    getUser,
} = require('../controllers/users');

/*
This info is token free but the plan is to have a super user who can use the same /:id path but will be able to see 
aditional info like phone numbers if necessary. 
*/

router.route('/')
      .get(getAllUsers)

router.route('/:id')
      .get(getUser)

module.exports = router;
