class AppError extends Error {
    constructor(message, statusCode) {
        super(message); // Gọi constructor của lớp Error cha
        this.statusCode = statusCode; // Mã trạng thái HTTP (400, 404, 500, v.v.)
        this.status = `${statusCode}`.startsWith(4) ? 'fail' : 'error'; // 'fail' cho 4xx, 'error' cho 5xx
        this.isOperational = true; // Đánh dấu là lỗi vận hành

        Error.captureStackTrace(this, this.constructor); // Ghi lại stack trace
    }
}

module.exports = AppError;
