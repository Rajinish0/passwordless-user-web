const { StatusCodes } = require('http-status-codes');
const GenericAPIError = require('../errors/GenericAPIError');
const BadReqestWithInfoError = require('../errors/BadRequestWithInfoError');

const errorHandlerMW = (err, req, res, next) => {
    console.log(err);
    console.log("Caught the error");
    if (err instanceof BadReqestWithInfoError){
        console.log(err.msg);
        return res.status(err.statusCode)
                  .render('info', {info: err.message});
    }
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
        /*
        i want the errors to be available on the client side for validation
        so for each field that was wrong the error will be availbe in the body as
        req.body.details.firstName for example
        */
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

    if (err.name === 'TokenExpiredError'){
        return res.status(StatusCodes.UNAUTHORIZED)
                  .render('info', {info: "Your token is expired"} );
                //   .redirect('/expired.html');
        // return res.status(StatusCodes.UNAUTHORIZED)
                //   .json({msg: "Token expired"});
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR)
       .json({msg : "Unknown server error occured, Check the logs."});
}

module.exports = errorHandlerMW;