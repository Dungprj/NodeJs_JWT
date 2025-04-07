const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');
const ApiResponse = require('../../../utils/apiResponse'); // Import ApiResponse
const userProfileService = require('../../../services/user/profile/profileService');
const upload = require('../../../utils/upload'); // Import Multer config
const commom = require('../../../common/common');
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
        upload.single('avatar')(req, res, async err => {
            if (err) {
                return next(new AppError(err.message, 400)); // Xử lý lỗi upload
            }

            // Giả sử userId được lấy từ req.user (thông qua middleware xác thực)
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError('Không tìm thấy thông tin người dùng', 401);
            }

            // Thêm tên file ảnh vào data
            const newProfileData = {
                ...req.body,
                avatar: req.file ? req.file.filename : null
            };

            const result = await userProfileService.updateUser(
                userId,
                newProfileData
            );

            if (result.status == 'fail' || result.status == 'error') {
                return ApiResponse.error(res, result);
            }

            // neu la chu quan thi logout tat ca tai khoan nhan vien

            if (req.type == 'Owner') {
                await commom.LogoutTaiKhoanNhanVien(userId);
            }
            return ApiResponse.success(
                res,
                result,
                'Cập nhật hồ sơ thành công',
                200
            );
        });
    }),
    // Cập nhật thông tin hồ sơ người dùng (200 OK | 404 Not Found)
    deleteProfile: catchAsync(async (req, res) => {
        // Giả sử userId được lấy từ req.user (thông qua middleware xác thực)
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('Không tìm thấy thông tin người dùng', 401);
        }
        const profileUser = await userProfileService.deleteUser(userId);

        // neu la chu quan thi logout tat ca tai khoan nhan vien

        if (req.type == 'Owner') {
            await commom.LogoutTaiKhoanNhanVien(userId);
        }
        return ApiResponse.success(res, null, 'xóa hồ sơ thành công', 204);
    })
};

module.exports = userProfileController;
