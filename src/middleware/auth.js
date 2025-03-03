const jwt = require('jsonwebtoken');
require('dotenv').config();
const { pathToRegexp, match } = require('path-to-regexp'); // Thêm match từ path-to-regexp
const pool = require('../config/db');

const versionRoute = '/v1';
const whiteListPaths = ['/', '/register', '/login', '/logout', '/refresh'];

/**
 * Kiểm tra xem đường dẫn có trong whitelist không.
 */
const isWhitelisted = url => {
    return whiteListPaths.some(path => `/v1/auth${path}` === url);
};

/**
 * Xử lý xác thực token từ header.
 */
const getTokenFromHeader = authorizationHeader => {
    if (!authorizationHeader) return null;
    const token = authorizationHeader.split(' ')[1];
    return token || null;
};

/**
 * Middleware xác thực token và lấy quyền từ idRole
 */
const middleware = {
    auth: async (req, res, next) => {
        // Kiểm tra whitelist
        if (isWhitelisted(req.originalUrl)) {
            console.log('Accessing white list path:', req.originalUrl);

            return next();
        }

        console.log('Checking token for request:', req.originalUrl);

        const token = getTokenFromHeader(req.headers.authorization);

        if (!token) {
            return res.status(401).json({ message: 'Token is missing' });
        }

        try {
            // Xác thực token
            jwt.verify(
                token,
                process.env.JWT_ACCESS_SECRET,
                async (err, user) => {
                    if (err) {
                        return res
                            .status(403)
                            .json({ message: 'Token is invalid' });
                    }

                    // Lưu thông tin user vào req
                    req.user = user;
                    next();
                }
            );
        } catch (error) {
            return res
                .status(500)
                .json({ message: 'Server Error ' + error.message });
        }
    },

    /**
     * Middleware kiểm tra quyền admin hoặc chính mình
     * Thay vì kiểm tra role name, ta kiểm tra idRole
     */
    verifyTokenAdminAndYourself: async (req, res, next) => {
        console.log('id request ', req.user);
        console.log('id param ', req.params);

        const idRole = req.user.idRole;
        const userId = req.user.id;
        const requestedId = req.params.id;

        // Giả sử idRole của admin là 2 (cần thay bằng giá trị thực tế từ DB của bạn)
        const ADMIN_ROLE_ID = 2;

        // Kiểm tra nếu user là chính mình hoặc có idRole của admin
        if (userId === requestedId || idRole === ADMIN_ROLE_ID) {
            return next();
        }

        return res.status(403).json({ message: 'Not Permission' });
    }
};

module.exports = middleware;
