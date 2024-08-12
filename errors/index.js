const BadRequestError   = require('./BadRequestError');
const GenericAPIError   = require('./GenericAPIError');
const NotFoundError     = require('./NotFoundError');
const UnauthorizedError = require('./UnauthorizedError');

module.exports = {
    GenericAPIError,
    BadRequestError,
    NotFoundError,
    UnauthorizedError
}