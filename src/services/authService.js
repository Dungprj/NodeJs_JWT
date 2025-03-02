const User = require('../models/user');
const Token = require('../models/Token');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const pool = require('../config/db');

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
    createUserService2: async (name, email, password) => {
        try {
            //kiem tra user co ton tai hay chua
            const queryCheckExits = `SELECT * FROM User WHERE email = ?`;
            const [users] = await pool.execute(queryCheckExits, [email]);
            //neu user khong ton tai
            if (users.length > 0) {
                throw new Error('Email is exists');
            }
            //create salt
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const query = `INSERT INTO User (name, email, password) VALUES (?, ?, ?)`;
            const [respone] = await pool.execute(query, [
                name,
                email,
                hashedPassword
            ]);
            return respone.affectedRows > 0;
        } catch (err) {
            console.log(err);
            throw new Error(err.message || 'Error creating user');
        }
    },

    // Tạo user mới
    createUserService: async (name, email, password) => {
        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error('Email already exists');
            }

            const hashedPassword = await bcrypt.hash(password, salt);
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
    handleLoginService2: async (email, password) => {
        try {
            //kiem tra user co ton tai hay chua
            const queryCheckExits = `SELECT * FROM User WHERE email = ?`;
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

            return {
                message: 'Login successful',
                accessToken,
                refreshToken,
                user: { id: user[0].id, email: user[0].email }
            };
        } catch (error) {
            throw new Error(error.message || 'Error logging in');
        }
    },
    handleLoginService: async (email, password) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                throw new Error('sai pass');
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
        return jwt.sign({ id: user.id }, process.env.JWT_ACCESS_SECRET, {
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
        return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
            expiresIn: process.env.JWT_REFRESH_EXPIRE
        });
    },
    refreshTokenService2: async refreshToken => {
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
            const queryGetUserById = `SELECT * FROM User WHERE id = ?`;
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
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            };
        } catch (error) {
            throw new Error(error.message || 'Invalid refresh token');
        }
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
