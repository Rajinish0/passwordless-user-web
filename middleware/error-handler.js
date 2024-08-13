const { StatusCodes } = require('http-status-codes');
const GenericAPIError = require('../errors/GenericAPIError');

const errorHandlerMW = (err, req, res, next) => {
    console.log(err);
    console.log("Caught the error");
    if (err instanceof GenericAPIError)
        return (res.status(err.statusCode)
                   .json({msg : err.message}));
    if (err.code === 11000)
        return (res.status(StatusCodes.BAD_REQUEST)
                   .json({
                    msg: "Duplicate key error",
                   }))
    if (err.name === 'ValidationError'){
        // console.log(err.errors);
        const acctualErrors = Object
                                .keys(err.errors)
                                .reduce( (acc, key) => {
                                        acc[key]  = err.errors[key].message
                                        return acc},  {} ) ;
        return res.
        status(StatusCodes.BAD_REQUEST)
        .json({
            msg: 'Validation failed',
            details: acctualErrors
        }
        )
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR)
       .json({msg : "Unknown server error occured, Check the logs."});
}

module.exports = errorHandlerMW;