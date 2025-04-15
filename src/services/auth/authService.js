const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const ms = require('ms');
const catchAsync = require('../../utils/catchAsync');
const durationInMs = ms(process.env.JWT_REFRESH_EXPIRE);

const { Sequelize } = require('sequelize');

const User = require('../../db/models/user');
const Token = require('../../db/models/token');
const RolePermission = require('../../db/models/rolepermissions');
const Role = require('../../db/models/roles');
const Permission = require('../../db/models/permissions');

const AppError = require('../../utils/appError');
const { json } = require('express');
const commom = require('../../common/common');

const checkPlanLimits = require('../../middleware/checkPlanLimits');
const Plan = require('../../db/models/plan');

require('dotenv').config();

// Hàm tính thời gian hết hạn (expiresAt) dựa trên giá trị từ .env
const getExpiresAtFromDuration = duration => {
    const now = new Date();
    const durationInMs = commom.parseDurationToMilliseconds(duration);
    return new Date(now.getTime() + durationInMs);
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
        created_at = Date(),
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
            throw new AppError('Email already exists', 409);
        }

        const planCurrent = await Plan.findByPk(plan_id);

        const calcPlanExpire = commom.calculateEndTime(
            created_at,
            planCurrent.duration
        );

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
            plan_expire_date: calcPlanExpire,
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

        delete result.confirmPassword;

        delete result.deletedAt;

        //tính toán hết hạn khi mới đăng ký

        await newUser.save();

        // Trả về response
        return result;
    },
    handleLoginService: async (email, password) => {
        try {
            //kiem tra user co ton tai hay chua
            //kiem tra co ton tai khong
            const isExistUser = await User.findOne({
                include: {
                    model: Plan
                },
                where: {
                    email: email
                }
            });

            console.log('thong tin user ', isExistUser);

            //neu user khong ton tai
            if (!isExistUser) {
                throw new AppError('Email not exists', 404);
            }

            const isParent = isExistUser.type == 'Owner';

            //đồng bộ redis
            if (!isParent) {
                checkPlanLimits.syncSubUserCount(isExistUser.parent_id);
                checkPlanLimits.syncCustomerCount(isExistUser.parent_id);
                checkPlanLimits.syncVendorCount(isExistUser.parent_id);
            } else {
                checkPlanLimits.syncSubUserCount(isExistUser.id);
                checkPlanLimits.syncCustomerCount(isExistUser.id);
                checkPlanLimits.syncVendorCount(isExistUser.id);
            }

            // const isMatch = await bcrypt.compare(
            //     password,
            //     isExistUser.password
            // );
            // if (!isMatch) {
            //     throw new AppError('Invalid email or password', 404);
            // }

            const accessToken = await authService.generateAccessToken(
                isExistUser
            );
            const refreshToken = await authService.generateRefreshToken(
                isExistUser
            );

            const refreshExpireAt = getExpiresAtFromDuration(
                process.env.JWT_REFRESH_EXPIRE
            );

            const accessExpireAt = getExpiresAtFromDuration(
                process.env.JWT_ACCESS_EXPIRE
            );

            //them token moi

            const responseInsertToken = await Token.create({
                userId: isExistUser.id,
                refreshToken: refreshToken,
                accessToken: accessToken,
                refreshExpireAt: refreshExpireAt,
                accessExpireAt: accessExpireAt,
                isValid: true,
                createdAt: new Date(),
                updatedAt: null
            });
            if (!responseInsertToken) {
                throw new AppError('Error insert token', 400);
            }

            //Truy vấn database để lấy danh sách quyền dựa trên idRole
            const permissions = await commom.getListPermission(
                isExistUser.type
            );
            console.log('permissions: ' + permissions);

            const [roleId] = await Promise.all([
                Role.findAll({
                    attributes: ['id'],
                    include: {
                        model: User,
                        attributes: [],
                        as: 'Role_user'
                    },
                    where: {
                        name: isExistUser.type
                    }
                })
            ]);

            const parent = await User.findOne({
                where: {
                    id: isExistUser.parent_id
                }
            });

            // const planCurrent = await Plan.findByPk(isExistUser.plan_id);

            return {
                message: 'Login successful',
                accessToken: accessToken,
                refreshToken: refreshToken,
                user: {
                    id: isExistUser.id,
                    email: email,
                    avatar: isExistUser.avatar,
                    name: isExistUser.name,
                    parentName: parent.name,
                    roleId: roleId[0].id,
                    planId: isExistUser.plan_id,
                    planName: isExistUser.Plan.dataValues.name,
                    planDuration: isExistUser.plan_expire_date,
                    planExpire: isExistUser.plan_expire_date,
                    roleName: isExistUser.type
                },
                permissions: permissions
            };
        } catch (error) {
            throw new AppError(error.message || 'Error logging in', 400);
        }
    },

    // Tạo access token
    generateAccessToken: async user => {
        if (!process.env.JWT_ACCESS_SECRET) {
            throw new AppError('JWT_ACCESS_SECRET is not defined', 404);
        }
        if (!process.env.JWT_ACCESS_EXPIRE) {
            throw new AppError('JWT_ACCESS_EXPIRE is not defined', 404);
        }

        const UserParent = await User.findByPk(user.parent_id);
        return jwt.sign(
            {
                id: user.id,
                type: user.type,
                parent_id: user.parent_id,
                typeParent: UserParent.type
            },
            process.env.JWT_ACCESS_SECRET,
            {
                expiresIn: process.env.JWT_ACCESS_EXPIRE
            }
        );
    },

    // Tạo refresh token
    generateRefreshToken: async user => {
        if (!process.env.JWT_REFRESH_SECRET) {
            throw new AppError('JWT_REFRESH_SECRET is not defined', 400);
        }
        if (!process.env.JWT_REFRESH_EXPIRE) {
            throw new AppError('JWT_REFRESH_EXPIRE is not defined', 400);
        }

        const UserParent = await User.findByPk(user.parent_id);
        return jwt.sign(
            {
                id: user.id,
                type: user.type,
                parent_id: user.parent_id,
                typeParent: UserParent.type
            },
            process.env.JWT_REFRESH_SECRET,
            {
                expiresIn: process.env.JWT_REFRESH_EXPIRE
            }
        );
    },
    refreshTokenService: async (refreshToken, accessToken) => {
        if (!refreshToken) {
            throw new AppError('No refresh token provided', 400);
        }

        if (!process.env.JWT_REFRESH_SECRET) {
            throw new AppError('JWT_REFRESH_SECRET is not defined', 400);
        }

        const refreshTokenRecord = await Token.findOne({
            where: { refreshToken: refreshToken }
        });
        if (!refreshTokenRecord) {
            throw new AppError('Invalid refresh token', 404);
        }

        const accessTokenRecord = await Token.findOne({
            where: { accessToken: accessToken }
        });
        if (!accessTokenRecord) {
            throw new AppError('Invalid or expired accessToken token', 400);
        }

        if (!refreshTokenRecord) {
            throw new AppError('Invalid or expired refresh token', 400);
        }

        if (!refreshTokenRecord.refreshIsValid) {
            throw new AppError('Refresh token has been invalidated', 400);
        }
        if (refreshTokenRecord.refreshExpireAt < new Date()) {
            throw new AppError('Refresh token has expired', 400);
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        //get user by decodeid

        const User_Decode = await User.findOne({
            where: {
                id: decoded.id,
                type: decoded.type
            }
        });

        if (!User_Decode) {
            throw new AppError('User not found', 400);
        }

        const newAccessToken = await authService.generateAccessToken(
            User_Decode
        );
        const newRefreshToken = await authService.generateRefreshToken(
            User_Decode
        );

        //expireRefreshToken
        const refreshExpireAt = getExpiresAtFromDuration(
            process.env.JWT_REFRESH_EXPIRE
        );

        //expireAccessToken
        const accessExpireAt = getExpiresAtFromDuration(
            process.env.JWT_ACCESS_EXPIRE
        );

        //tim va update token refresh
        const [response] = await Token.update(
            {
                refreshToken: newRefreshToken, // Giá trị mới cho refreshToken
                accessToken: newAccessToken,
                refreshExpireAt: refreshExpireAt,
                accessExpireAt: accessExpireAt, // Giá trị mới cho expireAt
                accessIsValid: true,
                refreshIsValid: true
            },
            {
                where: {
                    refreshToken: refreshToken, // Điều kiện WHERE
                    accessToken: accessToken
                }
            }
        );

        if (!response) {
            throw new AppError('Error update token', 400);
        }

        return {
            user: User_Decode,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        };
    },

    disableRefreshTokenService: async refreshToken => {
        //kiem tra xem token da disable chua

        const isTokenExist = await Token.findOne({
            where: {
                refreshToken: refreshToken
            }
        });

        if (!isTokenExist) {
            throw new AppError('Refresh token is not exist', 400);
        }

        if (!isTokenExist.refreshIsValid) {
            throw new AppError('Refresh token is  already disabled', 400);
        }

        const response = await Token.update(
            {
                refreshIsValid: false
            },
            {
                where: {
                    refreshToken: refreshToken
                }
            }
        );

        if (!response) {
            throw new AppError('Error disable refresh token', 400);
        }
    },
    disableAccessTokenService: async accessToken => {
        const isTokenExist = await Token.findOne({
            where: {
                accessToken: accessToken
            }
        });

        if (!isTokenExist) {
            throw new AppError('accessToken is not exist', 400);
        }

        if (!isTokenExist.accessIsValid) {
            throw new AppError('accessToken is  already disabled', 400);
        }

        const response = await Token.update(
            {
                accessIsValid: false
            },
            {
                where: {
                    accessToken: accessToken
                }
            }
        );

        if (!response) {
            throw new AppError('Error disable access token', 400);
        }
    },
    disableBothTokenService: async (refreshToken, accessToken) => {
        const statusRefreshToken = false;
        const statusAccessToken = false;

        const isDisabled = await Token.findOne({
            where: {
                accessToken: accessToken,
                refreshToken: refreshToken,
                accessIsValid: false,
                refreshIsValid: false
            }
        });

        if (isDisabled) {
            throw new AppError(
                'accessToken and refreshToken is already disabled',
                400
            );
        }

        const response = await authService.invalidateTokenService(
            refreshToken,
            statusRefreshToken,
            accessToken,
            statusAccessToken
        );

        if (!response) {
            throw new AppError('Error logout token', 400);
        }
    },
    LogoutService: async (refreshToken, accessToken) => {
        const statusRefreshToken = false;
        const statusAccessToken = false;

        const response = await authService.invalidateTokenService(
            refreshToken,
            statusRefreshToken,
            accessToken,
            statusAccessToken
        );

        if (!response) {
            throw new AppError('Error logout token', 400);
        }
    },
    invalidateTokenService: async (
        refreshToken,
        statusRefreshToken,
        accessToken,
        statusAccessToken
    ) => {
        if (!refreshToken) {
            throw new AppError('No refresh token provided', 400);
        }
        if (statusRefreshToken == null || statusRefreshToken == undefined) {
            throw new AppError('No statusRefreshToken provided', 400);
        }
        if (!accessToken) {
            throw new AppError('No accessToken provided', 400);
        }
        if (statusAccessToken == null || statusAccessToken == undefined) {
            throw new AppError('No statusAccessToken provided', 400);
        }
        const response = await Token.update(
            {
                refreshIsValid: statusRefreshToken,
                accessIsValid: statusAccessToken
            },
            {
                where: {
                    refreshToken: refreshToken, // Tìm theo refreshToken
                    accessToken: accessToken // Tìm theo accessToken
                }
            }
        );

        if (!response) {
            throw new AppError('Error update token', 400);
        }

        return true;
    }
};

module.exports = authService;
