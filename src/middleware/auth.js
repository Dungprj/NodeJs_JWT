const jwt = require('jsonwebtoken');
require('dotenv').config();

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
 * Xác minh token.
 */

/**
 * Middleware xác thực token.
 */

const middleware = {
    auth: (req, res, next) => {
        if (isWhitelisted(req.originalUrl)) {
            console.log('Accessing white list path:', req.originalUrl);
            return next();
        }

        console.log('Checking token for request:', req.originalUrl);

        const token = getTokenFromHeader(req.headers.authorization);

        if (!token) {
            return res.status(401).json({ message: 'token is missing' });
        }

        try {
            jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
                if (err) {
                    return res
                        .status(403)
                        .json({ message: 'Token is invalid' });
                }

                req.user = user;
                next();
            });
        } catch (error) {
            return res
                .status(500)
                .json({ message: 'Server Error ' + error.message });
        }
    },
    verifyTokenAdminAndYourself: (req, res, next) => {
        console.log('id request ', req.user);
        console.log('id param ', req.params);
        if (req.user.id === req.params.id || req.user.role === 'admin') {
            return next();
        }

        return res.status(403).json({ message: 'Not Permision' });
    }
};
module.exports = middleware;
