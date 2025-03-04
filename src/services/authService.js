require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const ms = require('ms');

// Hàm tính thời gian hết hạn (expiresAt) dựa trên giá trị từ .env
const getExpiresAtFromDuration = duration => {
    const now = new Date();
    const durationInMs = ms(duration);
    return new Date(now.getTime() + durationInMs);
};

const authService = {
    handleRegisterService: async (
        name = '',
        email,
        password,
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
        try {
            const queryCheckExits = `SELECT * FROM users WHERE email = ?`;
            const [users] = await pool.execute(queryCheckExits, [email]);
            if (users.length > 0) {
                throw new Error('Email is exists');
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const query = `INSERT INTO users (name, email, address, email_verified_at, password, avatar, parent_id, type, branch_id, cash_register_id, lang, mode, plan_id, plan_expire_date, plan_requests, is_active, user_status, remember_token, created_at, updated_at, last_login_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const [response] = await pool.execute(query, [
                name,
                email,
                address,
                email_verified_at,
                hashedPassword,
                avatar,
                parent_id,
                type,
                branch_id,
                cash_register_id,
                lang,
                mode,
                plan_id,
                plan_expire_date,
                plan_requests,
                is_active,
                user_status,
                remember_token,
                created_at,
                updated_at,
                last_login_at
            ]);
            return response.affectedRows > 0;
        } catch (err) {
            throw new Error(err.message || 'Error creating user');
        }
    },

    handleLoginService: async (email, password) => {
        try {
            const queryCheckExits = `SELECT * FROM users WHERE email = ?`;
            const [user] = await pool.query(queryCheckExits, [email]);
            if (user.length === 0) {
                throw new Error('Invalid email or password');
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

            const queryInsertToken = `INSERT INTO Token (userId, refreshToken, expireAt, isValid) VALUES (?, ?, ?, ?)`;
            const [response] = await pool.execute(queryInsertToken, [
                user[0].id,
                refreshToken,
                expiresAt,
                true
            ]);

            if (response.affectedRows === 0) {
                throw new Error('Error inserting token');
            }

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
                                WHERE r.name = ?`;
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

    generateAccessToken: user => {
        if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_ACCESS_EXPIRE) {
            throw new Error('JWT configuration is missing');
        }
        return jwt.sign(
            { id: user.id, type: user.type },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRE }
        );
    },

    generateRefreshToken: user => {
        if (
            !process.env.JWT_REFRESH_SECRET ||
            !process.env.JWT_REFRESH_EXPIRE
        ) {
            throw new Error('JWT configuration is missing');
        }
        return jwt.sign(
            { id: user.id, type: user.type },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRE }
        );
    },

    refreshTokenService: async refreshToken => {
        try {
            if (!refreshToken) {
                throw new Error('No refresh token provided');
            }

            const queryGetTokenByRefreshToken = `SELECT * FROM Token WHERE refreshToken = ?`;
            const [tokenRecord] = await pool.execute(
                queryGetTokenByRefreshToken,
                [refreshToken]
            );

            if (tokenRecord.length === 0) {
                throw new Error('Invalid or expired refresh token');
            }

            if (
                !tokenRecord[0].isValid ||
                tokenRecord[0].expireAt < new Date()
            ) {
                throw new Error('Invalid or expired refresh token');
            }

            const decoded = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET
            );
            const queryGetUserById = `SELECT * FROM users WHERE id = ?`;
            const [user] = await pool.execute(queryGetUserById, [decoded.id]);

            if (!user || user.length === 0) {
                throw new Error('User not found');
            }

            const newAccessToken = authService.generateAccessToken(user[0]);
            const newRefreshToken = authService.generateRefreshToken(user[0]);
            const expiresAt = getExpiresAtFromDuration(
                process.env.JWT_REFRESH_EXPIRE
            );

            const queryInvalidateOldToken = `UPDATE Token SET isValid = ? WHERE refreshToken = ?`;
            await pool.execute(queryInvalidateOldToken, [false, refreshToken]);

            const queryInsertNewToken = `INSERT INTO Token (userId, refreshToken, expireAt, isValid) VALUES (?, ?, ?, ?)`;
            const [response] = await pool.execute(queryInsertNewToken, [
                user[0].id,
                newRefreshToken,
                expiresAt,
                true
            ]);

            if (response.affectedRows === 0) {
                throw new Error('Error inserting new refresh token');
            }

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
            const queryInvalidateToken = `UPDATE Token SET isValid = ? WHERE refreshToken = ?`;
            const [response] = await pool.execute(queryInvalidateToken, [
                false,
                refreshToken
            ]);
            if (response.affectedRows === 0) {
                throw new Error('Token not found or already invalidated');
            }
        } catch (error) {
            throw new Error(error.message || 'Error invalidating token');
        }
    },

    handleChangePasswordService: async (userId, oldPassword, newPassword) => {
        try {
            // Kiểm tra user tồn tại
            const queryGetUserById = `SELECT * FROM users WHERE id = ?`;
            const [user] = await pool.execute(queryGetUserById, [userId]);
            if (!user || user.length === 0) {
                throw new Error('User not found');
            }

            // Kiểm tra mật khẩu cũ
            const isMatch = await bcrypt.compare(oldPassword, user[0].password);
            if (!isMatch) {
                throw new Error('Old password is incorrect');
            }

            // Mã hóa mật khẩu mới
            const salt = await bcrypt.genSalt(10);
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);

            // Cập nhật mật khẩu mới trong bảng users
            const queryUpdatePassword = `UPDATE users SET password = ?, updated_at = ? WHERE id = ?`;
            const updatedAt = new Date();
            const [updateResponse] = await pool.execute(queryUpdatePassword, [
                hashedNewPassword,
                updatedAt,
                userId
            ]);

            if (updateResponse.affectedRows === 0) {
                throw new Error('Error updating password');
            }

            // Vô hiệu hóa tất cả refreshToken hiện tại của user
            const queryInvalidateAllTokens = `UPDATE Token SET isValid = ? WHERE userId = ?`;
            const [invalidateResponse] = await pool.execute(
                queryInvalidateAllTokens,
                [false, userId]
            );

            return {
                message:
                    'Password changed successfully. All other sessions have been logged out.',
                affectedTokens: invalidateResponse.affectedRows // Số token bị vô hiệu hóa
            };
        } catch (error) {
            throw new Error(error.message || 'Error changing password');
        }
    }
};

module.exports = authService;
