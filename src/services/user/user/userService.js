require('dotenv').config();

const User = require('../../../db/models/user');
const Role = require('../../../db/models/roles');
const Branch = require('../../../db/models/branch');
const CastRegister = require('../../../db/models/cashregister');

const AppError = require('../../../utils/appError');

const userService = {
    getListUser: async user => {
        const users = await User.findAll({
            where: {
                parent_id: user.id
            }
        });

        if (users.length <= 0) {
            throw new AppError('List User not found', 404);
        }

        const result = users.map(u => {
            const res = u.toJSON();

            delete res.password;

            delete res.confirmPassword;

            delete res.deletedAt;
            return res;
        });

        return result;
    },
    getUserInit: async user => {
        //get danh sach vai tro cua user dang dang nhap

        const roleList = await Role.findAll({
            attributes: ['id', 'name'],
            where: {
                created_by: user.id
            }
        });
        //get danh sach chi nhanh user dang dang nhap
        const branchList = await Branch.findAll({
            attributes: ['id', 'name'],
            where: {
                created_by: user.id
            }
        });

        //get danh sach may tinh tien user dang dang nhap

        const cashRegisterList = await CastRegister.findAll({
            attributes: ['id', 'name'],
            where: {
                created_by: user.id
            }
        });

        return {
            roleList,
            branchList,
            cashRegisterList
        };
    },
    handleStatusUser: async (id, status) => {
        const user = await User.findByPk(id);
        if (!user) {
            throw new AppError('Không tìm thấy user để xử lý trạng thái', 404);
        }

        if (id && status) {
            user.is_active = status;
        }

        await user.save();
        return user;
    },
    addUser: async (user, data) => {
        const {
            name,
            email,
            password,
            confirmPassword,
            address = 'ha noi',
            email_verified_at = null,
            avatar = null,
            parent_id = user.id,
            type,
            branch_id,
            cash_register_id,
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
        } = data;

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
        delete result.confirmPassword;
        delete result.deletedAt;
        // Trả về response
        return result;
    },

    updateUser: async (id, data) => {
        // Tìm user theo id
        const user = await User.findByPk(id);
        if (!user) {
            throw new AppError('Không tìm thấy user để cập nhật', 404);
        }

        // Destructuring dữ liệu từ data với giá trị mặc định
        const {
            name,
            email,
            password,
            confirmPassword,
            address,
            email_verified_at = null,
            avatar = null,
            type,
            branch_id,
            cash_register_id,
            lang,
            mode,
            plan_id,
            plan_expire_date = null,
            plan_requests,
            is_active,
            user_status,
            remember_token,
            created_at,
            updated_at,
            last_login_at
        } = data;

        // Kiểm tra email nếu có thay đổi (không trùng với email khác)
        if (email && email !== user.email) {
            const isExistUser = await User.findOne({
                where: {
                    email: email
                }
            });
            if (isExistUser) {
                throw new AppError('Email đã tồn tại', 409);
            }
        }

        // Cập nhật các trường của user
        await user.update({
            name: name || user.name, // Giữ giá trị cũ nếu không cung cấp
            email: email || user.email,
            password: password || user.password, // Nên mã hóa nếu thay đổi password
            confirmPassword: confirmPassword || user.confirmPassword,
            address: address,
            email_verified_at: email_verified_at,
            avatar: avatar,
            type: type || user.type,
            branch_id: branch_id || user.branch_id,
            cash_register_id: cash_register_id || user.cash_register_id,
            lang: lang,
            mode: mode,
            plan_id: plan_id,
            plan_expire_date: plan_expire_date,
            plan_requests: plan_requests,
            is_active: is_active,
            user_status: user_status,
            remember_token: remember_token,
            created_at: created_at || user.created_at,
            updated_at: updated_at || new Date(), // Cập nhật thời gian mới
            last_login_at: last_login_at || user.last_login_at
        });

        // Chuyển đổi sang JSON và xóa các trường nhạy cảm
        const result = user.toJSON();
        delete result.password;
        delete result.confirmPassword;
        delete result.deletedAt;

        return result;
    },
    setAgainPassword: async (id, data) => {
        const user = await User.findByPk(id);
        if (!user) {
            throw new AppError('Không tìm thấy user để thay đổi mật khẩu', 404);
        }

        const { password, confirmPassword } = data;

        if (password !== confirmPassword) {
            throw new AppError('Mật khẩu nhập lại không trùng khớp', 400);
        }
        await user.update({
            password: password,
            confirmPassword: confirmPassword
        });
        return user;
    }
};

module.exports = userService;
