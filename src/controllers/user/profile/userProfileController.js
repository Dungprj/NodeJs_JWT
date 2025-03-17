const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');
const ApiResponse = require('../../../utils/apiResponse'); // Import ApiResponse
const userProfileService = require('../../../services/user/profile/profileService');

const userProfileController = {
    // Lấy danh sách người dùng (200 OK)
    getListUser: catchAsync(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const data = await userProfileService.getListUserService(page, limit);
        return ApiResponse.success(
            res,
            data,
            'Lấy danh sách người dùng thành công',
            200
        );
    }),

    // Lấy thông tin người dùng theo ID (200 OK | 404 Not Found)
    getuserById: catchAsync(async (req, res) => {
        const data = await userProfileService.getUserByIdService(req.params.id);
        if (!data) throw new AppError('Người dùng không tồn tại', 404);

        return ApiResponse.success(
            res,
            data,
            'Lấy thông tin người dùng thành công',
            200
        );
    }),

    // Xóa người dùng (204 No Content | 404 Not Found)
    deleteUser: catchAsync(async (req, res) => {
        const success = await userProfileService.deleteUser(req.params.id);
        if (!success)
            throw new AppError(
                'Xóa người dùng thất bại hoặc không tồn tại',
                404
            );

        return ApiResponse.success(res, null, 'Xóa người dùng thành công', 204);
    }),

    // Cập nhật người dùng (200 OK | 404 Not Found)
    updateUser: catchAsync(async (req, res) => {
        const success = await userProfileService.updateUser(
            req.params.id,
            req.body
        );
        if (!success)
            throw new AppError(
                'Cập nhật người dùng thất bại hoặc không tồn tại',
                404
            );

        return ApiResponse.success(
            res,
            null,
            'Cập nhật người dùng thành công',
            200
        );
    })
};

module.exports = userProfileController;
