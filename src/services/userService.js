require('dotenv').config();

const User = require('../db/models/user');
const Token = require('../db/models/token');
const RolePermission = require('../db/models/rolepermissions');
const Role = require('../db/models/roles');
const Permission = require('../db/models/permissions');
const AppError = require('../utils/appError');

const userService = {
    // Lấy danh sách tất cả người dùng
    getListUserService: async (page = 1, limit = 10) => {
        const users = await User.findAll();

        if (!users) {
            throw new AppError('List User not found');
        }

        return users;
    },

    // Xóa người dùng theo id và xóa token liên quan
    deleteUser: async id => {
        try {
            const query = 'DELETE FROM users where id = ?';
            const [respone] = await pool.execute(query, [id]);
            return respone.affectedRows > 0;
        } catch (error) {
            console.log(error);
            return false;
        }
    },

    // Lấy thông tin người dùng theo id
    getUserByIdService: async id => {
        const user = await User.findByPk(id);

        return user;
    },

    // Cập nhật thông tin người dùng
    updateUser: async (id, data) => {
        try {
            //kiem tra user co ton tai hay chua
            const queryCheckExits = `SELECT * FROM users WHERE id = ?`;
            const [users] = await pool.execute(queryCheckExits, [id]);
            //neu user khong ton tai
            if (users.length < 0) {
                throw new Error('Email not exists');
            }

            const query = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
            const [respone] = await pool.execute(query, [
                data.name ? data.name : users[0].name,
                data.email ? data.email : users[0].email,
                id
            ]);
            return respone.affectedRows > 0;
        } catch (error) {
            throw new Error(error.message);
        }
    }
};

module.exports = userService;
