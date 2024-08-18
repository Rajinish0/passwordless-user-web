const User = require('../models/user');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthorizedError, NotFoundError, BadRequestWithInfoError } = require('../errors/index');
const { hashPass, processReqWithPhoto } = require('../utils');
const fs = require('fs');
const path = require('path');

const THIRTY_MINS_IN_MS = 30 * 60 * 1000;

const updateUser = async (req, res, next) => {
try{
    const id = req.params.id;
    if (!id)
        return next(new BadRequestError("Id required for this route"));
    if (id != req.user.userId)
        return next(new UnauthorizedError("Not authorized to update another user"))
    const { firstName, lastName, password, batch, phoneNum, facebook, instagram } = req.body;

    updateData = {}
    if (firstName) updateData.firstName = firstName.trim();
    if (lastName) updateData.lastName = lastName.trim();
    if (batch) updateData.batch = batch.trim();
    if (phoneNum) updateData.phoneNum = phoneNum.trim();
    if (facebook) updateData.facebook = facebook.trim();
    if (instagram) updateData.instagram = instagram.trim();

    if (req.files){
        const finalPath = await processReqWithPhoto(req, id);
        updateData.imagePath = finalPath;
    }        

    const userId = req.user.userId;
    // const user_ = await User.findById();
    const user_ = await User.findByIdAndUpdate(
        {_id : id },
        updateData,
        {new : true, runValidators: true}
    )

    if (!user_)
        return next(new NotFoundError(`No user with id: ${userId}`));

    res.status(StatusCodes.OK)
       .json({
        user_
       });
}
catch(err){
    next(err);
}
finally{
    if (req.files && req.files.photo && 
        req.files.photo.tempFilePath !=
        path.join( path.dirname('..'), 'uploads', 'default-image.jpg')
    )
        fs.unlink(req.files.photo.tempFilePath, (err)=>{});
    }
}

const deleteUser = async (req, res, next) => {
    const userId = req.user.userId;
    const id = req.params.id;

    if (userId != id)
        return next ( new UnauthorizedError("Not authorized to delete") );

    const user_ = await User.findByIdAndDelete(
        {_id: id }
    );

    if (!user_)
        return next( new NotFoundError(`No user with id ${id}`) );

    if (path.basename(user_.imagePath) !== 'default-image.jpg')
        fs.unlink(user_.imagePath, (err)=>{
            if (err)
                console.log(`ERROR DELETING ${id}'s photo: ${err}`)
            })

    res.status(StatusCodes.OK)
       .send();
}

/*
pofile.html uses this function, rn I'm allowing the user to update their profile for as long as their
token is valid, if i want to restrict that just need to uncomment  the lines
*/
const getUserForUpdate = async (req, res, next) => {
    const userId = req.user.userId;
    const id = req.params.id;

    if (userId != id)
        return next (new UnauthorizedError("Not authorized"));

    const user_ = await User.findOne({_id : id})
                            .select('-lastVerifyRequest -updatedAt -createdAt');
    if (!user_)
        throw new NotFoundError(`No User with id ${id}`);

    // if ((Date.now() - user_.updatedAt)< THIRTY_MINS_IN_MS)
        // throw new BadRequestWithInfoError("Profile was updated less than 30 mins ago");

    res.status(
        StatusCodes.OK
    ).json( {user:user_} );
}

module.exports = {
    updateUser,
    deleteUser,
    getUserForUpdate
}