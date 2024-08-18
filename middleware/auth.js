const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../errors');

const auth = async (req, res, next) => {
    console.log('NORMAL AUTH WORKING');
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return next(new UnauthorizedError("Authentication failed"));

    const token = authHeader.split(' ')[1];
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