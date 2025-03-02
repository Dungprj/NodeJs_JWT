// src/models/User.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db'); // Kết nối Sequelize
const sequelizePaginate = require('sequelize-paginate');
class User extends Model {}

User.init(
    {
        name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        idRole: {
            // Thay vì 'role', sử dụng 'idRole'
            type: DataTypes.INTEGER,
            allowNull: false, // Đây là trường bắt buộc
            defaultValue: 3
        }
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users', // Tên bảng trong MySQL
        timestamps: false,
        createdAt: 'created_on',
        updatedAt: 'updated_on'
    }
);
// Thêm tính năng phân trang vào model User
sequelizePaginate.paginate(User);
module.exports = User;
