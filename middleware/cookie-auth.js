const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../errors');

const auth = async (req, res, next) => {
    console.log('COOKIE AUTH WORKING');
    if (!req.cookies || !req.cookies.token){
        console.log('here!!');
        return next(new UnauthorizedError("Authentication failed"));
    }

    const token = req.cookies.token;
    try {
        console.log('AUTHORIZED')
        const payload = jwt.verify(
            token, process.env.JWT_SECRET
        )
        req.user = {
            userId: payload.userId,
            userEmail : payload.userEmail
        }
        next();
    }
    catch (error){
        console.log(error);
        next(error);
        // throw new UnauthorizedError("Authentication failed");
    }
}

module.exports = auth;