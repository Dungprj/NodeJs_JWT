const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const ms = require('ms');
const catchAsync = require('../utils/catchAsync');
const durationInMs = ms(process.env.JWT_REFRESH_EXPIRE);

const User = require('../db/models/user');
const AppError = require('../utils/appError');
const { json } = require('express');

require('dotenv').config();

// Hàm tính thời gian hết hạn (expiresAt) dựa trên giá trị từ .env
const getExpiresAtFromDuration = duration => {
    const now = new Date();
    const durationInMs = parseDurationToMilliseconds(duration);
    return new Date(now.getTime() + durationInMs);
};

// Hàm chuyển đổi định dạng thời gian từ chuỗi sang milliseconds
const parseDurationToMilliseconds = duration => {
    const units = {
        s: 1000, // seconds
        m: 1000 * 60, // minutes
        h: 1000 * 60 * 60, // hours
        d: 1000 * 60 * 60 * 24, // days
        y: 1000 * 60 * 60 * 24 * 365 // years
    };

    const match = duration.match(/^(\d+)([smhdy])$/);
    if (!match) {
        throw new Error(`Invalid duration format: ${duration}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];
    return value * units[unit];
};

const authService = {
    handleRegisterService: async (
        email,
        password,
        confirmPassword,
        address = 'ha noi',
        email_verified_at = null,
        avatar = null,
        parent_id = 1,
        type = 'Owner',
        branch_id = 0,
        cash_register_id = 0,
        lang = 'vi',
        mode = 'light',
        plan_id = 1,
        plan_expire_date = null,
        plan_requests = 0,
        is_active = 0,
        user_status = 0,
        remember_token = null,
        created_at = null,
        updated_at = null,
        last_login_at = null
    ) => {
        //kiem tra co ton tai khong
        const isExistUser = await User.findOne({
            where: {
                email: email
            }
        });

        if (isExistUser) {
            throw new AppError('Email already exists', 400);
        }

        const newUser = await User.create({
            email: email,
            password: password,
            confirmPassword: confirmPassword,
            name: '',
            address: address,
            email_verified_at: email_verified_at,
            avatar: avatar,
            parent_id: parent_id,
            type: type,
            branch_id: branch_id,
            cash_register_id: cash_register_id,
            lang: lang,
            mode: mode,
            plan_id: plan_id,
            plan_expire_date: plan_expire_date,
            plan_requests: plan_requests,
            is_active: is_active,
            user_status: user_status,
            remember_token: remember_token,
            created_at: created_at,
            updated_at: updated_at,
            last_login_at: last_login_at
        });

        if (!newUser) {
            return new AppError('Failed to create this user', 400);
        }

        const result = newUser.toJSON();

        delete result.password;
        delete result.deletedAt;

        // Trả về response
        return result;
    },
    handleLoginService: async (email, password) => {
        try {
            //kiem tra user co ton tai hay chua
            const queryCheckExits = `SELECT * FROM users WHERE email = ?`;
            const [user] = await pool.query(queryCheckExits, [email]);

            //neu user khong ton tai
            if (user.length < 0) {
                throw new Error(
                    'Invalid email or password khong ton tai email'
                );
            }

            const isMatch = await bcrypt.compare(password, user[0].password);
            if (!isMatch) {
                throw new Error('Invalid email or password');
            }

            const accessToken = authService.generateAccessToken(user[0]);
            const refreshToken = authService.generateRefreshToken(user[0]);

            const expiresAt = getExpiresAtFromDuration(
                process.env.JWT_REFRESH_EXPIRE
            );

            const queryInsertToken = `INSERT INTO Token (userId, refreshToken, expireAt,isValid) VALUES (?, ?, ?,?)`;
            const [response] = await pool.execute(queryInsertToken, [
                user[0].id,
                refreshToken,
                expiresAt,
                true
            ]);

            if (response.affectedRows < 0) {
                throw new Error('Error insert token');
            }

            // Truy vấn database để lấy danh sách quyền dựa trên idRole
            const [permissions] = await pool.query(
                `SELECT p.name 
                 FROM permissions p
                 JOIN role_has_permissions rp ON p.id = rp.permission_id
                 JOIN roles r ON r.id = rp.role_id 
                 WHERE r.name = ?`,
                [user[0].type]
            );

            const queryGetRoleId = `SELECT DISTINCT r.id 
                                FROM roles r
                                JOIN users u ON r.name = u.type
                                WHERE r.name = ?;`;
            const [roleId] = await pool.query(queryGetRoleId, [user[0].type]);

            return {
                message: 'Login successful',
                accessToken,
                refreshToken,
                user: {
                    id: user[0].id,
                    email: email,
                    name: user[0].name,
                    roleId: roleId[0].id,
                    roleName: user[0].type
                },
                permissions: permissions.map(per => per.name)
            };
        } catch (error) {
            throw new Error(error.message || 'Error logging in');
        }
    },

    // Tạo access token
    generateAccessToken: user => {
        if (!process.env.JWT_ACCESS_SECRET) {
            throw new Error('JWT_ACCESS_SECRET is not defined');
        }
        if (!process.env.JWT_ACCESS_EXPIRE) {
            throw new Error('JWT_ACCESS_EXPIRE is not defined');
        }
        return jwt.sign(
            { id: user.id, type: user.type },
            process.env.JWT_ACCESS_SECRET,
            {
                expiresIn: process.env.JWT_ACCESS_EXPIRE
            }
        );
    },

    // Tạo refresh token
    generateRefreshToken: user => {
        if (!process.env.JWT_REFRESH_SECRET) {
            throw new Error('JWT_REFRESH_SECRET is not defined');
        }
        if (!process.env.JWT_REFRESH_EXPIRE) {
            throw new Error('JWT_REFRESH_EXPIRE is not defined');
        }
        return jwt.sign(
            { id: user.id, type: user.type },
            process.env.JWT_REFRESH_SECRET,
            {
                expiresIn: process.env.JWT_REFRESH_EXPIRE
            }
        );
    },
    refreshTokenService: async refreshToken => {
        try {
            if (!refreshToken) {
                throw new Error('No refresh token provided');
            }

            if (!process.env.JWT_REFRESH_SECRET) {
                throw new Error('JWT_REFRESH_SECRET is not defined');
            }

            const queryGetTokenByRefreshToken = `SELECT * FROM Token WHERE refreshToken = ?`;
            const [tokenRecord] = await pool.execute(
                queryGetTokenByRefreshToken,
                [refreshToken]
            );

            if (tokenRecord.length < 0) {
                throw new Error('Invalid or expired refresh token');
            }

            if (
                !tokenRecord[0] ||
                !tokenRecord[0].isValid ||
                tokenRecord[0].expiresAt < new Date()
            ) {
                throw new Error('Invalid or expired refresh token 2');
            }

            const decoded = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET
            );

            //get user by decodeid
            const queryGetUserById = `SELECT * FROM users WHERE id = ?`;
            const [user] = await pool.execute(queryGetUserById, [decoded.id]);

            if (!user || user.length < 0) {
                throw new Error('User not found');
            }

            const newAccessToken = authService.generateAccessToken(user[0]);
            const newRefreshToken = authService.generateRefreshToken(user[0]);

            const expiresAt = getExpiresAtFromDuration(
                process.env.JWT_REFRESH_EXPIRE
            );

            //tim va update token refresh
            const queryUpdateToken = `UPDATE Token SET refreshToken = ?, expireAt = ?, isValid = ? WHERE refreshToken = ?`;
            const [response] = await pool.execute(queryUpdateToken, [
                newRefreshToken,
                expiresAt,
                true,
                refreshToken
            ]);
            return {
                user: user[0],
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            };
        } catch (error) {
            throw new Error(error.message || 'Invalid refresh token');
        }
    },

    invalidateTokenService: async refreshToken => {
        try {
            await Token.findOneAndUpdate({ refreshToken }, { isValid: false });
        } catch (error) {
            throw new Error('Error invalidating token');
        }
    }
};

module.exports = authService;
