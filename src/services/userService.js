const User = require('../models/User'); // Model Role
const Token = require('../models/Token'); // Model Permissions

require('dotenv').config();

const userService = {
    // Lấy danh sách tất cả người dùng
    getListUserService: async (page = 1, limit = 10) => {
        try {
            // Sử dụng phương thức paginate từ sequelize-paginate
            const { docs, pages, total } = await User.paginate({
                page: page, // Trang hiện tại
                paginate: limit, // Số bản ghi trên mỗi trang
                attributes: ['id', 'name', 'email', 'idRole'], // Các trường cần lấy
                order: [['created_on', 'DESC']] // Sắp xếp theo ngày tạo
            });

            return {
                success: true,
                data: docs, // Danh sách người dùng
                pagination: {
                    currentPage: page,
                    limit: limit,
                    totalItems: total,
                    totalPages: pages
                }
            };
        } catch (error) {
            console.log('Error in getListUserService:', error);
            return {
                success: false,
                message: 'Failed to fetch users',
                error: error.message
            };
        }
    },

    // Xóa người dùng theo id và xóa token liên quan
    deleteUser: async id => {
        try {
            // Tìm người dùng theo ID
            const user = await User.findByPk(id);
            if (!user) {
                throw new Error('User not found');
            }

            // Xóa các token liên quan đến người dùng này
            await Token.destroy({ where: { userId: id } }); // Xóa token liên quan đến userId

            // Xóa người dùng
            await user.destroy(); // Xóa người dùng
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    },

    // Lấy thông tin người dùng theo id
    getUserByIdService: async id => {
        try {
            const user = await User.findByPk(id); // Sử dụng Sequelize để tìm người dùng theo ID
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    // Cập nhật thông tin người dùng
    updateUser: async (id, data) => {
        try {
            // Kiểm tra người dùng có tồn tại không
            const user = await User.findByPk(id);
            if (!user) {
                throw new Error('User not found');
            }

            // Cập nhật thông tin người dùng
            const updatedUser = await user.update({
                name: data.name || user.name, // Cập nhật name nếu có
                email: data.email || user.email // Cập nhật email nếu có
            });

            return updatedUser ? true : false;
        } catch (error) {
            throw new Error(error.message);
        }
    }
};

module.exports = userService;
