const { StatusCodes } = require('http-status-codes');
const GenericAPIError = require('./GenericAPIError');

class BadRequestError extends GenericAPIError {
    constructor(message) {
        super(message, StatusCodes.BAD_REQUEST);
    }
}

module.exports = BadRequestError;