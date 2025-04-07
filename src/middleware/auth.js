const jwt = require('jsonwebtoken');
require('dotenv').config();
const { match } = require('path-to-regexp'); // Đảm bảo rằng path-to-regexp đã được cài đặt

const User = require('../db/models/user');
const Token = require('../db/models/token');
const RolePermission = require('../db/models/rolepermissions');
const Role = require('../db/models/roles');
const Permission = require('../db/models/permissions');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const versionRoute = '/v1';
const whiteListPaths = [
    '/',
    '/register',
    '/login',
    '/logout',
    '/refresh',
    '/disableRefreshToken',
    '/disableAccessToken',
    '/disableBothToken'
];

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
    auth: catchAsync(async (req, res, next) => {
        // Kiểm tra whitelist
        if (isWhitelisted(req.originalUrl)) {
            console.log('Accessing white list path:', req.originalUrl);
            return next();
        }

        const token = getTokenFromHeader(req.headers.authorization);

        const accessTokenRecord = await Token.findOne({
            where: { accessToken: token }
        });

        if (!token) {
            throw new AppError('Token is missing', 401);
        }
        if (!accessTokenRecord) {
            throw new AppError('Invalid access token not found ', 401);
        }

        if (!accessTokenRecord.accessIsValid) {
            throw new AppError('Invalid access token ', 401);
        }

        if (accessTokenRecord.accessExpireAt < new Date()) {
            throw new AppError('expired access token ', 401);
        }
        //check isvalid access token
        jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET,
            async (err, payload) => {
                //user trong đây là kết quả của việc giải mã thông tin đã mã hóa trong lúc tạo token
                if (err) {
                    return next(new AppError('Error verify token', 400));
                }

                req.user = payload;
                req.type = payload.type;
                req.typeParent = payload.typeParent;

                const isParent = payload.type == 'Owner';

                if (!isParent) {
                    req.idQuery = payload.parent_id;

                    req.typeQuery = req.typeParent;
                } else {
                    req.idQuery = payload.id;
                    req.typeQuery = payload.type;
                }
            }
        );

        return next();
    })
};

module.exports = middleware;
