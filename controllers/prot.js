const User = require('../models/user');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthorizedError, NotFoundError } = require('../errors/index');
const { hashPass } = require('../utils');

const updateUser = async (req, res, next) => {
    const id = req.params.id;
    if (!id)
        return next(new BadRequestError("Id required for this route"));
    if (id != req.user.userId)
        return next(new UnauthorizedError("Not authorized to update another user"))
    const { firstName, password, batch } = req.body;

    updateData = {}
    if (firstName) updateData.firstName = firstName;
    if (batch) updateData.batch = batch;
    if (password) updateData.password = await hashPass(password);

    const userId = req.user.userId;
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
    res.status(StatusCodes.OK)
       .send();
}

module.exports = {
    updateUser,
    deleteUser,
}