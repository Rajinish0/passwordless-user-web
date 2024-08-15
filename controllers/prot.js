const User = require('../models/user');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthorizedError, NotFoundError } = require('../errors/index');
const { hashPass, processReqWithPhoto } = require('../utils');
const fs = require('fs');
const path = require('path');

const updateUser = async (req, res, next) => {
try{
    const id = req.params.id;
    if (!id)
        return next(new BadRequestError("Id required for this route"));
    if (id != req.user.userId)
        return next(new UnauthorizedError("Not authorized to update another user"))
    const { firstName, password, batch } = req.body;

    updateData = {}
    if (firstName) updateData.firstName = firstName;
    if (batch) updateData.batch = batch;
    //the problem with password is that im saving the hashed value, so i have two choices
    //either i change the pre save function and check for password length there
    //or check the length here, im doing that here for now since im using findByIdAndUpdate
    //but might change that later.
    if (password && password.length < 8) return next(new BadRequestError("min password length: 8"));
    if (password) updateData.password = await hashPass(password);
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

    if (user_.imagePath != 
        path.join(path.dirname('..'), 'uploads', 'default-image.jpg')
        )
        fs.unlink(user_.imagePath, (err)=>{
            if (err)
                console.log(`ERROR DELETING ${id}'s photo: ${err}`)
            })

    res.status(StatusCodes.OK)
       .send();
}

module.exports = {
    updateUser,
    deleteUser,
}