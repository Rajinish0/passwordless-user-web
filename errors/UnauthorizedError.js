const { StatusCodes } = require('http-status-codes');
const GenericAPIError = require('./GenericAPIError');

class UnauthorizedError extends GenericAPIError {
    constructor(message){
        super(message, StatusCodes.UNAUTHORIZED);
    }
}

module.exports = UnauthorizedError;