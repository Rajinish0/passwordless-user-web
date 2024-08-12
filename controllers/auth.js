const User = require('../models/user');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthorizedError } = require('../errors/index');


const register = async (req, res, next) => {
    try{
        console.log("HERE");
        console.log(req.body);
        const user = await User.create({ ...req.body });
        const token = user.createJWT();
        console.log('done!!');
        res.status(StatusCodes.CREATED)
        .json(
            {user : user.firstName,
            token
            }
        )
    } 
    catch (error){
        console.log("sending error!!!")
        next(error);
    }
}

const login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password)
        return next(new BadRequestError("Please provide email and password"));

    const user = await User.findOne( {email} )
    if (!user)
        return next(new UnauthorizedError("Invalid email"));
    const checkPass = await user.comparePassword(password);

    if (!checkPass)
        return next(new UnauthorizedError("Invalid password"));

    const token = user.createJWT();
    res.status(
        StatusCodes.OK
    ).json(
        {user : user.firstName,
         token
        }
    )
}

module.exports = {
    register,
    login,
}