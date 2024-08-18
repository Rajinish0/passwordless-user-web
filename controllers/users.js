const { StatusCodes } = require("http-status-codes");
const user = require("../models/user");
const { NotFoundError } = require("../errors");
const jwt = require('jsonwebtoken')


const getAllUsers = async (req, res, next) => {
try{
    const MAX_LIMIT = process.env.MAX_PAGE_LIMIT || 100;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, MAX_LIMIT);
    const skip = (page - 1) * limit;

    let query = {};

    const SUPER_USR_ID = process.env.SUPER_USR_ID;
    if (SUPER_USR_ID)
        query._id = { $ne : SUPER_USR_ID };

    if (req.query.firstname)
        query.firstName = { $regex: req.query.firstname, $options: 'i' };
        // query.firstName = req.query.firstname.trim();
    if (req.query.lastname)
        query.lastName = { $regex: req.query.lastname, $options: 'i' };
        // query.lastname = req.query.lastname.trim();
    if (req.query.batch){
        let batch = Number(req.query.batch.trim());
        if (!isNaN(batch))
            query.batch = batch;
    }

    const users = await user.find( query )
                            .select("-activated -lastVerifyRequest -updatedAt -createdAt -phoneNum")
                            .skip(skip)
                            .limit(limit);

    const totalUsers = await user.countDocuments(query);

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

/* 
TO DO:
I should probably make another middle ware for this
that just introuces the id from the cookie into the req parameter
and does not raise any error - with this approach i could have multiple middle wares
where none of those raise errors. Cookie checker and "Bearer " token checker could be
different middlewares
*/

const getUser = async (req, res, next) => {
try{
    const id = req.params.id;
    console.log(id);
    let hasPermissions = false;
    console.log(req.cookies.token);
    if (req.cookies.token != null){
        try{
            const payload = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
            hasPermissions = (payload.userId === process.env.SUPER_USR_ID)
        }
        catch(err){
            console.log(err);
        }
    }
    const user_ = await user.findOne({_id : id})
                            .select('-lastVerifyRequest -updatedAt -createdAt');
    if (!user_)
        throw new NotFoundError(`No User with id ${id}`);

    if (hasPermissions){
        res.status(
            StatusCodes.OK
        ).json( {user:user_} );
        return
    }

    const { phoneNum, ...publicFields } = user_.toObject()

    res.status(StatusCodes.OK)
       .json({user: publicFields});
}
catch (err){
    next(err);
}
}

module.exports = {
    getAllUsers,
    getUser
};