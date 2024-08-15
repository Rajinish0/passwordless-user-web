const User = require('../models/user');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthorizedError } = require('../errors/index');
const { processReqWithPhoto, getMailConfig, transporter } = require('../utils');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');

/* 
The reason for using different JWT secrets here is that im exposing the token in the verify link, and I don't 
really want the user or anyone to be able to log in using the same token.
*/

const constructMail = (email, token) => {
    let cfg = getMailConfig();
    cfg.to = email;
    cfg.text = `Hello, you recently registered at our webiste. 
                Please follow the link below to verify your email:
                http://localhost:80/api/v1/auth/verify/${token}
                `
    return cfg
}

const register = async (req, res, next) => {
    try{
        console.log(req.body);
        console.log(req.files);
        const user = new User({ ...req.body });
        user.activated = false;
        const token = user.createJWT("8m", process.env.JWT_REG_SECRET);
        if (req.files && req.files.photo){
            const finalPath = await processReqWithPhoto(req, user._id);
            user.imagePath = finalPath;
        }

        const mailCfg = constructMail(user.email, token);
        console.log('done!!');

        await user.save();
        //TO DO: this is kind of tricky, if the mail never goes, the user should get deleted.
        await transporter.sendMail(mailCfg);
        res.status(StatusCodes.CREATED)
        .json(
            {user : user.firstName}
        )
    } 
    catch (error){
        console.log("sending error!!!")
        next(error);
    }
    finally {
        if (req.files && req.files.photo){
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

    if (!user.activated){
        return res.status(StatusCodes.UNAUTHORIZED)
           .json({
            msg: "Not Verified",
            id: user._id
           });
    }
        // return next(new UnauthorizedError("Not verified"));

    const token = user.createJWT();
    const expirationDate = new Date(Date.now() + 3600 * 1000);

    // Set cookies with the calculated expiration date
    /* 
    I think I might change some pages to being SSR later, so Im going to store the userId 
    in the cookies even though i don't need them for now.
    */
    res.cookie('token', token, { expires: expirationDate, httpOnly: true, secure: false });
    res.cookie('userId', user._id, { expires: expirationDate, httpOnly: true, secure: false });

    res.status(
        StatusCodes.OK
    ).json(
        {userId : user._id,
         token,
         expiresAt: expirationDate
        }
    )
}


const verify = async (req, res, next) => {
    const token = req.params.token;
    if (!token)
        return next(new BadRequestError("token must be specified for this end point"));

    try{
        const payload = jwt.verify(
            token, process.env.JWT_REG_SECRET
        )
        const id = payload.userId;
        const user_ = await User.findByIdAndUpdate(
            {_id: id},
            {activated: true}
        );

        if (!user_)
            return next(new BadRequestError("token was jeopradized, please try again."));

        res.send("You are verified, please log in to continue");
        
    }
    catch (err){
        next(err);
    }
}

const reqVerify = async (req, res, next) => {
    try{
        console.log('IM HERE NOW')
        if (!req.params.id)
            return next(new BadRequestError("Route requires id in url"));
        
        const id = req.params.id;
        const user_ = await User.findById(id);
        if (!user_)
            return next(new BadRequestError("No user found with this id"));

        const token = user_.createJWT("8m", process.env.JWT_REG_SECRET);
        const mailCfg = constructMail(user_.email, token);

        await transporter.sendMail(mailCfg);

        console.log('AND HERE NOW');
        res.status(StatusCodes.OK)
           .send();
        // next();
    }
    catch (err){
        console.log('ERR HERE');
        console.log(err);
        next(err);
    }
}

module.exports = {
    register,
    login,
    verify,
    reqVerify
}