const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');
const ApiResponse = require('../../../utils/apiResponse'); // Import ApiResponse
const userProfileService = require('../../../services/user/profile/profileService');

const userProfileController = {
    // Lấy thông tin hồ sơ người dùng hiện tại (200 OK | 404 Not Found)
    getProfile: catchAsync(async (req, res) => {
        // Giả sử userId được lấy từ req.user (thông qua middleware xác thực)
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('Không tìm thấy thông tin người dùng', 401);
        }

        const data = await userProfileService.getProfile(userId);
        return ApiResponse.success(
            res,
            data,
            'Lấy thông tin hồ sơ thành công',
            200
        );
    }),

    // Cập nhật thông tin hồ sơ người dùng (200 OK | 404 Not Found)
    updateProfile: catchAsync(async (req, res) => {
        // Giả sử userId được lấy từ req.user (thông qua middleware xác thực)
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('Không tìm thấy thông tin người dùng', 401);
        }

        const updatedData = await userProfileService.updateUser(
            userId,
            req.body
        );
        return ApiResponse.success(
            res,
            updatedData,
            'Cập nhật hồ sơ thành công',
            200
        );
    }),
    // Cập nhật thông tin hồ sơ người dùng (200 OK | 404 Not Found)
    deleteProfile: catchAsync(async (req, res) => {
        // Giả sử userId được lấy từ req.user (thông qua middleware xác thực)
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('Không tìm thấy thông tin người dùng', 401);
        }
        const profileUser = await userProfileService.deleteUser(userId);
        return ApiResponse.success(res, null, 'xóa hồ sơ thành công', 204);
    })
};

module.exports = userProfileController;
