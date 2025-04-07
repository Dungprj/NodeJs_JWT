const authService = require('../../services/auth/authService');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const ApiResponse = require('../../utils/apiResponse'); // Import ApiResponse

const authController = {
    // Tạo user mới (201 Created)
    handleRegister: catchAsync(async (req, res, next) => {
        const { email, password, confirmPassword } = req.body;
        const result = await authService.handleRegisterService(
            email,
            password,
            confirmPassword
        );

        return ApiResponse.success(
            res,
            result,
            'User registered successfully',
            201
        );
    }),

    // Xử lý login (200 OK)
    handleLogin: catchAsync(async (req, res) => {
        const { email, password } = req.body;
        const data = await authService.handleLoginService(email, password);
        soLuongQuyenHandled = 0;
        let listPermissionHandled = [];

        if (data.permissions && data.permissions.length > 0) {
            const soLuongQuyen = data.permissions.length;
            soLuongQuyenHandled = soLuongQuyen;
            const dataConvert = data.permissions.map(pers => ({
                [pers.name]: true
            }));

            // Gộp mảng thành một object
            const mergedObject = dataConvert.reduce(
                (result, item) => Object.assign(result, item),
                {}
            );

            listPermissionHandled = mergedObject;
        }

        return ApiResponse.success(
            res,
            {
                token: data.accessToken,
                refreshToken: data.refreshToken,
                user: {
                    email: email,
                    userTitle: data.user.name,
                    parentName: data.user.parentName,
                    databaseId: data.user.id,
                    roles: [
                        {
                            roleId: data.user.roleId,
                            roleName: data.user.roleName,
                            soLuongQuyen: soLuongQuyenHandled,
                            permissions: listPermissionHandled
                        }
                    ]
                }
            },
            'Login successful',
            200
        );
    }),

    // Yêu cầu refresh token (200 OK)
    requestRefreshToken: catchAsync(async (req, res) => {
        const { refreshToken, accessToken } = req.body;

        if (!refreshToken) throw new AppError('No refresh token provided', 400);
        if (!accessToken) throw new AppError('No access token provided', 400);

        const data = await authService.refreshTokenService(
            refreshToken,
            accessToken
        );

        return ApiResponse.success(
            res,
            {
                accessToken: data.accessToken,
                refreshToken: data.refreshToken
            },
            'Token refreshed successfully',
            200
        );
    }),

    // Vô hiệu hóa refresh token (204 No Content)
    disableRefreshToken: catchAsync(async (req, res) => {
        const { refreshToken } = req.body;
        if (!refreshToken) throw new AppError('No refresh token provided', 400);

        await authService.disableRefreshTokenService(refreshToken);
        return ApiResponse.success(
            res,
            null,
            'Refresh token was disabled successfully',
            204
        );
    }),

    // Vô hiệu hóa access token (204 No Content)
    disableAccessToken: catchAsync(async (req, res) => {
        const { accessToken } = req.body;
        if (!accessToken) throw new AppError('No access token provided', 400);

        await authService.disableAccessTokenService(accessToken);
        return ApiResponse.success(
            res,
            null,
            'Access token was disabled successfully',
            204
        );
    }),

    // Vô hiệu hóa cả access token & refresh token (204 No Content)
    disableBothToken: catchAsync(async (req, res) => {
        const { accessToken, refreshToken } = req.body;
        if (!accessToken) throw new AppError('No access token provided', 400);
        if (!refreshToken) throw new AppError('No refresh token provided', 400);

        await authService.disableBothTokenService(refreshToken, accessToken);
        return ApiResponse.success(
            res,
            null,
            'Access token and refresh token were disabled successfully',
            204
        );
    }),

    // Logout: Vô hiệu hóa refresh token và access token (200 OK)
    logout: catchAsync(async (req, res) => {
        const { refreshToken, accessToken } = req.body;
        if (!refreshToken) throw new AppError('No refresh token provided', 400);
        if (!accessToken) throw new AppError('No access token provided', 400);

        await authService.LogoutService(refreshToken, accessToken);
        return ApiResponse.success(res, null, 'Logged out successfully', 200);
    })
};

module.exports = authController;
