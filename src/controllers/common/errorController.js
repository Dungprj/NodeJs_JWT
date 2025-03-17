const AppError = require('../../utils/appError');
const ApiResponse = require('../../utils/apiResponse'); // Import ApiResponse

/**
 * Trả về lỗi trong môi trường phát triển
 */
const sendErrorDev = (err, res) => {
    return ApiResponse.error(res, err, err.stack);
};

/**
 * Trả về lỗi trong môi trường production
 */
const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        return ApiResponse.error(res, err);
    }

    console.error('❌ ERROR:', err);
    return ApiResponse.error(
        res,
        new AppError('Something went wrong. Please try again later.', 500)
    );
};

/**
 * Middleware xử lý lỗi toàn cục
 */
const globalErrorHandler = (err, req, res, next) => {
    console.error('🚨 Error detected:', err);

    // Xử lý lỗi JWT
    if (err.name === 'JsonWebTokenError') {
        err = new AppError('Invalid token. Please log in again.', 401);
    }

    if (err.name === 'TokenExpiredError') {
        err = new AppError('Token expired. Please log in again.', 401);
    }

    // Xử lý lỗi Sequelize
    if (err.name === 'SequelizeUniqueConstraintError') {
        err = new AppError(err.errors[0].message, 400);
    }

    if (err.name === 'SequelizeDatabaseError') {
        err = new AppError('Database error. Please check your request.', 400);
    }

    if (process.env.NODE_ENV === 'development') {
        return sendErrorDev(err, res);
    }

    return sendErrorProd(err, res);
};

module.exports = globalErrorHandler;
