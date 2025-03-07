const authService = require('../services/authService');

const authController = {
    // Tạo user mới
    handleRegister: async (req, res) => {
        try {
            const { email, password } = req.body;
            const name = '';
            const respone = await authService.handleRegisterService(
                name,
                email,
                password
            );
            return respone
                ? res.status(200).json('Create successfully')
                : res.status(404).json('Create failed');
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    // Xử lý login (trả refresh token trong body thay vì cookie)
    handleLogin: async (req, res) => {
        try {
            const { email, password } = req.body;

            const data = await authService.handleLoginService(email, password);

            const dataConvert = data.permissions.map(pers => {
                return {
                    [pers]: true
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
        } catch (error) {
            return res.status(500).json({
                status: error.message,
                message: 'Email hoặc mật khẩu không đúng',
                data: null
            });
        }
    },

    // Yêu cầu refresh token để tạo access token mới (client gửi refresh token trong body)
    requestRefreshToken: async (req, res) => {
        try {
            const { userId, accessToken, refreshToken } = req.body; // Lấy refresh token từ body thay vì cookie
            if (!refreshToken) {
                return res
                    .status(400)
                    .json({ message: 'No refresh token provided' });
            }

            const data = await authService.refreshTokenService(
                userId,
                accessToken,
                refreshToken
            );

            return res.status(200).json({
                message: 'Token refreshed successfully',
                accessToken: data.accessToken,
                refreshToken: data.refreshToken // Trả refresh token mới trong body
            });
        } catch (error) {
            return res.status(401).json({ message: error.message });
        }
    },
    handleChangePassword: async (req, res) => {
        try {
            const { userId, password, newPassword } = req.body;
            await authService.handleChangePasswordService(
                userId,
                password,
                newPassword
            );
            return res
                .status(200)
                .json('Password has been changed successfully');
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },
    // Logout: Vô hiệu hóa refresh token (client gửi refresh token trong body)
    logout: async (req, res) => {
        try {
            const { refreshToken } = req.body; // Lấy refresh token từ body
            if (!refreshToken) {
                return res
                    .status(400)
                    .json({ message: 'No refresh token provided' });
            }

            // Vô hiệu hóa refresh token trong database
            await authService.invalidateTokenService(refreshToken);

            return res.status(200).json({ message: 'Logged out successfully' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

module.exports = authController;
