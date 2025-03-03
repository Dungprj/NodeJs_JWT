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

                    // Lấy idRole từ token
                    const idRole = user.idRole;

                    // Truy vấn database để lấy danh sách quyền dựa trên idRole
                    const [permissions] = await pool.query(
                        `SELECT p.route, p.method 
                         FROM permissions p
                         JOIN role_permissions rp ON p.id = rp.idPermission
                         WHERE rp.idRole = ?`,
                        [idRole]
                    );

                    console.log(`Danh sach quyen cua ${idRole} :`);
                    permissions.forEach(perm => {
                        console.log(perm.route, perm.method);
                    });

                    // Lưu danh sách quyền vào req để middleware sau dùng
                    req.permissions = permissions;

                    // Kiểm tra quyền truy cập
                    const requestedRoute = req.originalUrl; // Ví dụ: '/v1/user/35'
                    const requestedMethod = req.method; // Ví dụ: 'DELETE'

                    let hasPermission = false;

                    for (const perm of permissions) {
                        // Chuyển route từ DB thành pattern và so sánh với requestedRoute
                        const routePattern = versionRoute + perm.route; // Ví dụ: '/v1/user/:id'

                        // Tạo hàm matcher từ pattern
                        const matcher = match(routePattern, {
                            decode: decodeURIComponent
                        });

                        // Kiểm tra khớp route
                        const routeMatch = matcher(requestedRoute);

                        const methodMatch =
                            perm.method.toUpperCase() === requestedMethod;

                        console.log('Route DB pattern:', routePattern);
                        console.log('Route request:', requestedRoute);
                        console.log('Route match:', !!routeMatch); // routeMatch là object nếu khớp, false nếu không
                        console.log('Method DB:', perm.method);
                        console.log('Method request:', requestedMethod);
                        console.log('Method match:', methodMatch);

                        if (routeMatch && methodMatch) {
                            hasPermission = true;
                            break;
                        }
                    }

                    console.log('Has permission:', hasPermission);

                    if (!hasPermission) {
                        return res.status(403).json({
                            message: 'Forbidden: You do not have permission'
                        });
                    }

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
