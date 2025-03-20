require('dotenv').config();

const User = require('../../../db/models/user');
const AppError = require('../../../utils/appError');

const userService = {
    addUser: async (
        name,
        email,
        password,
        confirmPassword,
        address = 'ha noi',
        email_verified_at = null,
        avatar = null,
        parent_id = 0,
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
            throw new AppError('Email already exists', 409);
        }

        const newUser = await User.create({
            name: name,
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
    }
};

module.exports = userService;
