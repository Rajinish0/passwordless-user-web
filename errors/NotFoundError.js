const { StatusCodes } = require('http-status-codes');
const GenericAPIError = require('./GenericAPIError');

class NotFoundError extends GenericAPIError {
    constructor(message){
        super(message, StatusCodes.NOT_FOUND);
    }
}

module.exports = NotFoundError;