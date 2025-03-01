const User = require('../models/user');
const Token = require('../models/Token');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const ms = require('ms');
const durationInMs = ms(process.env.JWT_REFRESH_EXPIRE);

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
    // Tạo user mới
    createUserService: async (name, email, password) => {
        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error('Email already exists');
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({ name, email, password: hashedPassword });
            await newUser.save();

            return {
                message: 'User created successfully',
                user: { id: newUser._id, email: newUser.email }
            };
        } catch (error) {
            throw new Error(error.message || 'Error creating user');
        }
    },

    handleLoginService: async (email, password) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                throw new Error('Invalid email or password');
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new Error('Invalid email or password');
            }

            const accessToken = authService.generateAccessToken(user);
            const refreshToken = authService.generateRefreshToken(user);

            const expiresAt = getExpiresAtFromDuration(
                process.env.JWT_REFRESH_EXPIRE
            );

            await Token.create({
                userId: user._id,
                refreshToken,
                expiresAt
            });

            return {
                message: 'Login successful',
                accessToken,
                refreshToken,
                user: { id: user._id, email: user.email }
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
        return jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET, {
            expiresIn: process.env.JWT_ACCESS_EXPIRE
        });
    },

    // Tạo refresh token
    generateRefreshToken: user => {
        if (!process.env.JWT_REFRESH_SECRET) {
            throw new Error('JWT_REFRESH_SECRET is not defined');
        }
        if (!process.env.JWT_REFRESH_EXPIRE) {
            throw new Error('JWT_REFRESH_EXPIRE is not defined');
        }
        return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
            expiresIn: process.env.JWT_REFRESH_EXPIRE
        });
    },

    refreshTokenService: async refreshToken => {
        try {
            if (!refreshToken) {
                throw new Error('No refresh token provided');
            }

            if (!process.env.JWT_REFRESH_SECRET) {
                throw new Error('JWT_REFRESH_SECRET is not defined');
            }

            const tokenRecord = await Token.findOne({ refreshToken });
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

            const user = await User.findById(decoded.id);
            if (!user) {
                throw new Error('User not found');
            }

            const newAccessToken = authService.generateAccessToken(user);
            const newRefreshToken = authService.generateRefreshToken(user);

            const expiresAt = getExpiresAtFromDuration(
                process.env.JWT_REFRESH_EXPIRE
            );

            await Token.findOneAndUpdate(
                { refreshToken }, //dieu kien query
                {
                    refreshToken: newRefreshToken,
                    expiresAt,
                    isValid: true
                }, //dữ liệu cần thay đổi
                { new: true } //trả về bản ghi mới sau khi thay đổi
            );

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
            await Token.findOneAndUpdate({ refreshToken }, { isValid: false });
        } catch (error) {
            throw new Error('Error invalidating token');
        }
    }
};

module.exports = authService;
module.exports = authService;
