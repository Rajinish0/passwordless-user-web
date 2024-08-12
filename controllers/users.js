const { StatusCodes } = require("http-status-codes");
const user = require("../models/user");
const { NotFoundError } = require("../errors");


const getAllUsers = async (req, res) => {
    const users = await user.find( {} )
                            .select("-password");
    res.status(
        StatusCodes.OK
    ).json({
        users,
        count: users.count
    })
}

const getUser = async (req, res) => {
    const id = req.params.id;
    const user_ = await user.findOne({
        _id: id
    })
    if (!user_)
        throw new NotFoundError(`No User with id ${id}`);
    req.status(
        StatusCodes.OK
    ).json( {user} );
}

module.exports = {
    getAllUsers,
    getUser
};