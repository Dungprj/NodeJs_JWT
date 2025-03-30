require('dotenv').config();

const User = require('../../../db/models/user');
const Token = require('../../../db/models/token');
const RolePermission = require('../../../db/models/rolepermissions');
const Role = require('../../../db/models/roles');
const Permission = require('../../../db/models/permissions');
const AppError = require('../../../utils/appError');
const { Op } = require('sequelize');

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
        const transaction = await User.sequelize.transaction();
        try {
            // Tìm user theo id
            const user = await User.findByPk(id);
            if (!user) {
                throw new AppError('Không tìm thấy user để cập nhật', 404);
            }

            // Destructuring dữ liệu từ data với giá trị mặc định
            const { name, email, address, lang, mode } = data;

            const avatar = data.avatar || user.avatar; // Cập nhật ảnh nếu có ảnh mới

            // Kiểm tra email nếu có thay đổi (không trùng với email khác)
            if (email && email !== user.email) {
                const isExistUser = await User.findOne({
                    where: {
                        email: email,
                        id: { [Op.ne]: id }
                    }
                });
                if (isExistUser) {
                    return new AppError('Email đã tồn tại', 409);
                }
            }

            // Cập nhật các trường của user
            await user.update(
                {
                    name: name || user.name, // Giữ giá trị cũ nếu không cung cấp
                    email: email || user.email,
                    address: address,
                    avatar: avatar,
                    lang: lang,
                    mode: mode
                },
                { transaction }
            );

            // Chuyển đổi sang JSON và xóa các trường nhạy cảm
            const result = user.toJSON();
            delete result.password;
            delete result.confirmPassword;
            delete result.deletedAt;
            await transaction.commit();
            return result;
        } catch (error) {
            // Rollback transaction nếu có lỗi
            await transaction.rollback();

            // Đảm bảo lỗi gốc được ném lại với mã trạng thái đúng
            if (error instanceof AppError) {
                throw error; // Giữ nguyên lỗi với mã trạng thái ban đầu (400, 409, v.v.)
            }
            // Nếu là lỗi không mong muốn, ném lỗi 500
            throw new AppError(error, 500);
        }
    },
    // Update current user's profile
    deleteUser: async id => {
        const transaction = await User.sequelize.transaction();
        try {
            // Tìm user theo id
            const user = await User.findByPk(id);
            if (!user) {
                throw new AppError('Không tìm thấy user để cập nhật', 404);
            }
            const result = await user.destroy({ transaction });
            await transaction.commit();
            return result;
        } catch (error) {
            // Rollback transaction nếu có lỗi
            await transaction.rollback();

            // Đảm bảo lỗi gốc được ném lại với mã trạng thái đúng
            if (error instanceof AppError) {
                throw error; // Giữ nguyên lỗi với mã trạng thái ban đầu (400, 409, v.v.)
            }
            // Nếu là lỗi không mong muốn, ném lỗi 500
            throw new AppError(error, 500);
        }
    }
};

module.exports = profileService;
