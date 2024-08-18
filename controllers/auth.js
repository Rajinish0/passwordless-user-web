const User = require('../models/user');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthorizedError, BadRequestWithInfoError } = require('../errors/index');
const { processReqWithPhoto, getMailConfig, transporter, minsInMs } = require('../utils');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');

const THIRTY_MINS_IN_MS = 30 * 60 * 1000;

/* 
The reason for using different JWT secrets here is that im exposing the token in the verify link, and I don't 
really want the user or anyone to be able to log in using the same token.
*/

const constructMail = (email, token) => {
    let cfg = getMailConfig();
    cfg.to = email;
    cfg.html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #4CAF50;">Welcome to Our Website!</h2>
            <p>Hello,</p>
            <p>Thank you for registering at our website. To complete your registration, please verify your email by clicking the button below:</p>
            <p style="text-align: center;">
                <a href="http://${process.env.DOMAIN_NAME || 'localhost'}:80/api/v1/auth/verify/${token}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
            </p>
            <p>If the button above doesn't work, you can also click the link below or copy and paste it into your browser:</p>
            <p><a href="http://${process.env.DOMAIN_NAME || 'localhost'}:80/api/v1/auth/verify/${token}">http://${process.env.DOMAIN_NAME || 'localhost'}:80/api/v1/auth/verify/${token}</a></p>
        </div>
    `;
    return cfg;
}


const constructMailForUpdate = (email, token) => {
    let cfg = getMailConfig();
    cfg.to = email;
    cfg.html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #4CAF50;">Data Update Request</h2>
            <p>Hello,</p>
            <p>You recently requested to update your data on our website. To proceed with the update, please click the button below:</p>
            <p style="text-align: center;">
                <a href="http://${process.env.DOMAIN_NAME || 'localhost'}:80/api/v1/auth/update/${token}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Update Data</a>
            </p>
            <p>If the button above doesn't work, you can also click the link below or copy and paste it into your browser:</p>
            <p><a href="http://${process.env.DOMAIN_NAME || 'localhost'}:80/api/v1/auth/update/${token}">http://${process.env.DOMAIN_NAME || 'localhost'}:80/api/v1/auth/update/${token}</a></p>
        </div>
    `;
    return cfg;
}


const register = async (req, res, next) => {
    try{
        console.log(req.body);
        console.log(req.files);
        const user = new User({ ...req.body });
        user.activated = false;
        const token = user.createJWT("30m", process.env.JWT_REG_SECRET);
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
try{
    const { email } = req.body;

    console.log('got the req');

    if (!email)
        return next(new BadRequestError("Please provide email"));

    const user = await User.findOne( {email} )
    if (!user)
        return next(new UnauthorizedError("Invalid email"));

    if (!user.activated){
        return res.status(StatusCodes.UNAUTHORIZED)
           .json({
            msg: "Not Verified",
            id: user._id
           });
    }

    console.log(Date.now()- user.updatedAt);
    console.log(email, process.env.SUPER_USR_EMAIL)
    console.log(Date.now(), user.lastVerifyRequest, user.createdAt);
    /* 
    I'm still debating if it is a good idea to let the user update their profile
    immediatly after they registered or not, but i have allowed this for now.
    */
    if (Date.now() - user.lastVerifyRequest < minsInMs(30) &&
        (user.lastVerifyRequest - user.createdAt > 1000))
        return next(new BadRequestError("Updated less than 30 mins ago"));

    user.lastVerifyRequest = Date.now();
    await user.save();

    let token;
    if (email === process.env.SUPER_USR_EMAIL)
        token = user.createJWT("30d");
    else
        token = user.createJWT("30m");
    // const expirationDate = new Date(Date.now() + 3600 * 1000);
    mailCfg = constructMailForUpdate(user.email, token);
    let info = await transporter.sendMail(mailCfg);
    console.log('sent', info);

    // Set cookies with the calculated expiration date
    /* 
    I think I might change some pages to being SSR later, so Im going to store the userId 
    in the cookies even though i don't need them for now.
    */
    // res.cookie('token', token, { expires: expirationDate, httpOnly: true, secure: false });
    // res.cookie('userId', user._id, { expires: expirationDate, httpOnly: true, secure: false });

    return res.status(StatusCodes.OK)
              .send();
}
catch (err){
    next(err);
}
}


const verify = async (req, res, next) => {
    const token = req.params.token;
    if (!token)
        return next(new BadRequestError("token must be specified for this end point"));

    try{
        console.log(token);
        const payload = jwt.verify(
            token, process.env.JWT_REG_SECRET
        )
        const id = payload.userId;

        console.log('HERE NOW');
        const user_ = await User.findByIdAndUpdate(
            {_id: id},
            {activated: true}
        );

        if (!user_)
            return next(new BadRequestError("token was jeopradized, please try again."));

        // res.send('you are verified');
        res.status(StatusCodes.OK)
           .redirect("/verified.html");
        
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

        if (user_.activated)
            return next(new BadRequestError("User already verified"));

        if (Date.now() - user_.lastVerifyRequest < minsInMs(30))
            return next(new BadRequestError("Requested verify link less than 30 mins ago"));

        user_.lastVerifyRequest = Date.now();
        await user_.save();
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

const update = async (req, res, next) => {
    const token = req.params.token;
    if (!token)
        return next(new UnauthorizedError("No token provided"));

    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user_ = await User.findById({_id : payload.userId});
        if (!user_)
            return next(new BadRequestWithInfoError("User corresponding to token not found"));
            // return next(new BadRequestError("User corresponding to token not found"));

        // if (Date.now() - user_.updatedAt < THIRTY_MINS_IN_MS)
            // return next(new BadRequestWithInfoError("Profile was updated less than 30 mins ago"));
            // return next(new BadRequestError("Updated less than 30 mins ago"));

        const id = payload.userId;
        let maxAge = (id === process.env.SUPER_USR_ID)? 3600 * 24 * 30 * 10000 : 3600 * 1000;
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            maxAge: maxAge
        })
        res.redirect(`/profile.html?id=${id}`);
    }
    catch (err){
        next(err);
    }
}

module.exports = {
    register,
    login,
    verify,
    reqVerify,
    update
}