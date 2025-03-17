const AppError = require('./appError');

class ApiResponse {
    /**
     * Trả về dữ liệu thành công
     */
    static success(res, data = {}, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data
        });
    }

    /**
     * Trả về lỗi chung từ AppError hoặc lỗi khác
     */
    static error(res, error, stack = null) {
        if (error instanceof AppError) {
            return res.status(error.statusCode || 400).json({
                success: false,
                message: error.message,
                stack: stack || undefined // Chỉ hiển thị stack nếu có
            });
        }

        // Nếu không phải AppError, trả lỗi mặc định
        return res.status(400).json({
            success: false,
            message: error.message || 'Bad Request'
        });
    }

    /**
     * Trả về lỗi không tìm thấy (404)
     */
    static notFound(res, message = 'Not Found') {
        return ApiResponse.error(res, new AppError(message, 404));
    }

    /**
     * Trả về lỗi server (500)
     */
    static serverError(res, message = 'Internal Server Error') {
        return ApiResponse.error(res, new AppError(message, 500));
    }
}

module.exports = ApiResponse;
