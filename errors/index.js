const BadRequestError   = require('./BadRequestError');
const GenericAPIError   = require('./GenericAPIError');
const NotFoundError     = require('./NotFoundError');
const UnauthorizedError = require('./UnauthorizedError');
const BadRequestWithInfoError = require('./BadRequestWithInfoError');

module.exports = {
    GenericAPIError,
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
    BadRequestWithInfoError
}