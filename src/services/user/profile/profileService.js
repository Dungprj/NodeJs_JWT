require('dotenv').config();

const User = require('../../../db/models/user');
const Token = require('../../../db/models/token');
const RolePermission = require('../../../db/models/rolepermissions');
const Role = require('../../../db/models/roles');
const Permission = require('../../../db/models/permissions');
const AppError = require('../../../utils/appError');

const profileService = {
    // Get current user's profile
    getProfile: async userId => {
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] } // Exclude sensitive fields
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        return user;
    },

    // Update current user's profile
    updateUser: async (id, data) => {
        // Tìm user theo id
        const user = await User.findByPk(id);
        if (!user) {
            throw new AppError('Không tìm thấy user để cập nhật', 404);
        }

        // Destructuring dữ liệu từ data với giá trị mặc định
        const { name, email, address, avatar = null, lang, mode } = data;

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
            address: address,
            avatar: avatar,
            lang: lang,
            mode: mode
        });

        // Chuyển đổi sang JSON và xóa các trường nhạy cảm
        const result = user.toJSON();
        delete result.password;
        delete result.confirmPassword;
        delete result.deletedAt;
        return result;
    },
    // Update current user's profile
    deleteUser: async id => {
        // Tìm user theo id
        const user = await User.findByPk(id);
        if (!user) {
            throw new AppError('Không tìm thấy user để cập nhật', 404);
        }
        const result = await user.destroy();
        return result;
    }
};

module.exports = profileService;
