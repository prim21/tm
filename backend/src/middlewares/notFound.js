const ApiResponse = require('../utils/response');

/**
 * 404 Not Found middleware
 */
const notFound = (req, res, next) => {
    return ApiResponse.notFound(res, `Route ${req.originalUrl} not found`);
};

module.exports = notFound;
