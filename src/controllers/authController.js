const authService = require('../services/authService');

const authController = {
    // Tạo user mới
    handleRegister: async (req, res) => {
        try {
            const { name, email, password } = req.body;
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

            return res.status(200).json({
                message: data.message,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken, // Trả refresh token trong body
                user: data.user
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    // Yêu cầu refresh token để tạo access token mới (client gửi refresh token trong body)
    requestRefreshToken: async (req, res) => {
        try {
            const { refreshToken } = req.body; // Lấy refresh token từ body thay vì cookie
            if (!refreshToken) {
                return res
                    .status(400)
                    .json({ message: 'No refresh token provided' });
            }

            const data = await authService.refreshTokenService(refreshToken);

            return res.status(200).json({
                message: 'Token refreshed successfully',
                accessToken: data.accessToken,
                refreshToken: data.refreshToken // Trả refresh token mới trong body
            });
        } catch (error) {
            return res.status(401).json({ message: error.message });
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
