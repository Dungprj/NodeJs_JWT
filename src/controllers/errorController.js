const AppError = require('../utils/appError');

const sendErrorDev = (error, res) => {
    const statusCode = error.statusCode || 500;
    const status = error.status || 'error';
    const message = error.message;
    const stack = error.stack;

    res.status(statusCode).json({
        status,
        message,
        stack
    });
};

const sendErrorProd = (error, res) => {
    const statusCode = error.statusCode || 500;
    const status = error.status || 'error';
    const message = error.message;
    const stack = error.stack;

    if (error.isOperations) {
        res.status(statusCode).json({
            status,
            message
        });
    }

    return res.status(500).json({
        status: 'error',
        message: 'Something went very wrong'
    });
};

const globalErrorHandler = (err, req, res, next) => {
    if (err.name === 'JsonWebTokenError') {
        err = new AppError('Invalid token', 401);
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
        err = new AppError(err.errors[0].message, 400);
    }

    let error = '';
    if (error.code === 5001) {
        error = new AppError();
    }
    (err, req, res, next) => {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stack: err.stack
        });
    };

    if (process.env.NODE_ENV === 'development') {
        return sendErrorDev(err, res);
    }

    sendErrorProd(err, res);
};

module.exports = globalErrorHandler;
