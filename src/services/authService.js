const Role = require('../models/Role');
const User = require('../models/User');
const Token = require('../models/Token');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const ms = require('ms');
const durationInMs = ms(process.env.JWT_REFRESH_EXPIRE);

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
    handleRegisterService: async (name, email, password) => {
        try {
            // Kiểm tra email đã tồn tại chưa
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                throw new Error('Email already exists');
            }

            // Mã hóa mật khẩu
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Tạo người dùng mới
            const newUser = await User.create({
                name,
                email,
                password: hashedPassword,
                idRole: 3 // Bạn có thể thay đổi ID vai trò nếu cần
            });

            return newUser ? true : false;
        } catch (err) {
            throw new Error(err.message || 'Error creating user');
        }
    },

    handleLoginService: async (email, password) => {
        try {
            // Kiểm tra người dùng có tồn tại không
            const user = await User.findOne({ where: { email } });

            if (!user) {
                throw new Error('Invalid email or password');
            }

            // So sánh mật khẩu
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new Error('Invalid email or password');
            }

            const accessToken = authService.generateAccessToken(user);
            const refreshToken = authService.generateRefreshToken(user);

            const expiresAt = getExpiresAtFromDuration(
                process.env.JWT_REFRESH_EXPIRE
            );

            // Lưu refresh token vào bảng Token
            const newToken = await Token.create({
                userId: user.id,
                refreshToken,
                expiresAt,
                isValid: true
            });

            // Lấy tên vai trò của người dùng
            const role = await Role.findByPk(user.idRole);

            return {
                message: 'Login successful',
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    idRole: user.idRole,
                    roleName: role ? role.name : 'Unknown'
                }
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
            { id: user.id, idRole: user.idRole }, // Sử dụng idRole thay vì role
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRE }
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
            { id: user.id, idRole: user.idRole }, // Sử dụng idRole thay vì role
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRE }
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

            // Kiểm tra refresh token trong bảng Token
            const tokenRecord = await Token.findOne({
                where: { refreshToken }
            });

            if (
                !tokenRecord ||
                !tokenRecord.isValid ||
                tokenRecord.expiresAt < new Date()
            ) {
                throw new Error('Invalid or expired refresh token');
            }

            const decoded = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET
            );

            // Lấy thông tin người dùng từ decoded
            const user = await User.findByPk(decoded.id);

            if (!user) {
                throw new Error('User not found');
            }

            const newAccessToken = authService.generateAccessToken(user);
            const newRefreshToken = authService.generateRefreshToken(user);

            const expiresAt = getExpiresAtFromDuration(
                process.env.JWT_REFRESH_EXPIRE
            );

            // Cập nhật refresh token trong bảng Token
            await tokenRecord.update({
                refreshToken: newRefreshToken,
                expiresAt,
                isValid: true
            });

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            };
        } catch (error) {
            throw new Error(error.message || 'Invalid refresh token');
        }
    },

    invalidateTokenService: async refreshToken => {
        try {
            if (!refreshToken) {
                throw new Error('No refresh token provided');
            }

            // Cập nhật token là không hợp lệ trong bảng Token
            const tokenRecord = await Token.findOne({
                where: { refreshToken }
            });

            if (tokenRecord) {
                await tokenRecord.update({ isValid: false });
            }

            return true;
        } catch (error) {
            throw new Error('Error invalidating token');
        }
    }
};

module.exports = authService;
