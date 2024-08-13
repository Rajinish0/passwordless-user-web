const User = require('../models/user');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthorizedError } = require('../errors/index');
const { processReqWithPhoto } = require('../utils');
const fs = require('fs');
const path = require('path');


const register = async (req, res, next) => {
    try{
        console.log(req.body);
        console.log(req.files);
        let imgPath =undefined;
        const user = new User({ ...req.body });
        const token = user.createJWT();
        if (req.files){
            const finalPath = await processReqWithPhoto(req, user._id);
            user.imagePath = finalPath;
        }

        console.log('done!!');
        await user.save();
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
    finally {
        if (req.files){
            const tmpFp = req.files.photo.tempFilePath;
            fs.access(tmpFp, fs.constants.F_OK, (err)=> {
                if (!err)
                    fs.unlink(req.files.photo.tempFilePath, (unlinkerr) => {
                        if (unlinkerr)
                            console.log(unlinkerr);
                    });
                else
                    console.log(err);
            })
        }
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