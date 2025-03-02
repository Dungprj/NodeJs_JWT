const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Kết nối sequelize

// Định nghĩa model Role
const Role = sequelize.define(
    'Role',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true // Tự động tăng
        },
        name: {
            type: DataTypes.STRING(255), // Tương ứng với varchar(255)
            allowNull: false // Không được phép null
        },
        description: {
            type: DataTypes.STRING(255), // Tương ứng với varchar(255)
            allowNull: false // Không được phép null
        }
    },
    {
        tableName: 'roles', // Tên bảng trong MySQL
        timestamps: false // Không sử dụng createdAt/updatedAt mặc định của Sequelize
    }
);

// Export model Role
module.exports = Role;
