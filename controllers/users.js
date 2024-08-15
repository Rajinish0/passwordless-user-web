const { StatusCodes } = require("http-status-codes");
const user = require("../models/user");
const { NotFoundError } = require("../errors");


const getAllUsers = async (req, res, next) => {
try{
    const MAX_LIMIT = process.env.MAX_PAGE_LIMIT || 100;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, MAX_LIMIT);
    const skip = (page - 1) * limit;
    const users = await user.find( {} )
                            .select("-password -activated")
                            .skip(skip)
                            .limit(limit);
    const totalUsers = await user.countDocuments();

    res.status(
        StatusCodes.OK
    ).json({
        users,
        count: users.length,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
        totalUsers
    })
}
catch (err){
    next(err);
}
}

const getUser = async (req, res, next) => {
try{
    const id = req.params.id;
    console.log(id);
    const user_ = await user.findOne({
        _id: id
    }).select("-password")
    if (!user_)
        throw new NotFoundError(`No User with id ${id}`);
    res.status(
        StatusCodes.OK
    ).json( {user:user_} );
}
catch (err){
    next(err);
}
}

module.exports = {
    getAllUsers,
    getUser
};