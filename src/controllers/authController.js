const authService = require('../services/authService');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const authController = {
    // Tạo user mới
    handleRegister: catchAsync(async (req, res, next) => {
        const { email, password, confirmPassword } = req.body;
        const result = await authService.handleRegisterService(
            email,
            password,
            confirmPassword
        );

        return res.status(201).json({
            status: 'success',
            data: result
        });
    }),

    // Xử lý login (trả refresh token trong body thay vì cookie)
    handleLogin: catchAsync(async (req, res) => {
        const { email, password } = req.body;

        const data = await authService.handleLoginService(email, password);

        const dataConvert = data.permissions.map(pers => {
            const key = pers.name;
            return {
                [key]: true
            };
        });

        // Gộp mảng thành một object
        const mergedObject = dataConvert.reduce((result, item) => {
            return Object.assign(result, item);
        }, {});

        return res.status(200).json({
            status: 'success',
            message: 'Đăng nhập thành công',
            data: {
                token: data.accessToken,
                refreshToken: data.refreshToken,
                user: {
                    email: email,
                    userTitle: data.user.name,
                    databaseId: data.user.id,
                    roles: [
                        {
                            roleId: data.user.roleId,
                            roleName: data.user.roleName,

                            //khong tra ve list permission nua
                            permissions: mergedObject
                            // permissions: {
                            //     salePermission: true,
                            //     partiesPermission: true,
                            //     purchasePermission: true,
                            //     productPermission: true,
                            //     profileEditPermission: false,
                            //     addExpensePermission: false,
                            //     lossProfitPermission: false,
                            //     dueListPermission: false,
                            //     stockPermission: false,
                            //     reportsPermission: false,
                            //     salesListPermission: false,
                            //     purchaseListPermission: false
                            // }
                        }
                    ]
                }
            }
        });
    }),

    // Yêu cầu refresh token để tạo access token mới (client gửi refresh token trong body)
    requestRefreshToken: catchAsync(async (req, res) => {
        const {
            refreshToken,

            accessToken
        } = req.body; // Lấy refresh token từ body thay vì cookie

        if (!refreshToken) {
            throw new AppError('No refresh token provided', 400);
        }

        if (!accessToken) {
            throw new AppError('No accessToken provided', 400);
        }

        const data = await authService.refreshTokenService(
            refreshToken,
            accessToken
        );

        return res.status(200).json({
            message: 'Token refreshed successfully',
            accessToken: data.accessToken,
            refreshToken: data.refreshToken // Trả refresh token mới trong body
        });
    }),

    //disableRefreshToken : vô hiệu hóa refresh token

    disableRefreshToken: catchAsync(async (req, res) => {
        const { refreshToken } = req.body;
        // Vô hiệu hóa refresh token trong database
        if (!refreshToken) {
            throw new AppError('No refresh token provided', 400);
        }

        await authService.disableRefreshTokenService(refreshToken);

        return res.status(200).json({
            message: ' refresh token was disabled successfully'
        });
    }),

    disableAccessToken: catchAsync(async (req, res) => {
        const { accessToken } = req.body;

        if (!accessToken) {
            throw new AppError('No access token provided', 400);
        }

        // Vô hiệu hóa refresh token trong database
        await authService.disableAccessTokenService(accessToken);

        return res.status(200).json({
            message: ' accessToken was disabled successfully'
        });
    }),

    disableBothToken: catchAsync(async (req, res) => {
        const { accessToken, refreshToken } = req.body;

        if (!accessToken) {
            throw new AppError('No access token provided', 400);
        }
        if (!refreshToken) {
            throw new AppError('No refresh token provided', 400);
        }

        // Vô hiệu hóa refresh token trong database
        await authService.disableBothTokenService(refreshToken, accessToken);

        return res.status(200).json({
            message: ' accessToken and refreshtoken was disabled successfully'
        });
    }),

    // Logout: Vô hiệu hóa refresh token  và access token
    logout: catchAsync(async (req, res) => {
        const { refreshToken, accessToken } = req.body; // Lấy refresh token từ body
        if (!refreshToken) {
            throw new AppError('No refresh token provided', 400);
        }

        if (!accessToken) {
            throw new AppError('No accessToken provided', 400);
        }

        // Vô hiệu hóa refresh token trong database
        await authService.LogoutService(refreshToken, accessToken);

        return res.status(200).json({
            message: 'Logged out successfully'
        });
    })
};

module.exports = authController;
