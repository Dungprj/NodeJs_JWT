const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Kết nối sequelize

// Định nghĩa model Permissions
const Permissions = sequelize.define(
    'Permissions',
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
        route: {
            type: DataTypes.STRING(255), // Tương ứng với varchar(255)
            allowNull: false // Không được phép null
        },
        method: {
            type: DataTypes.STRING(255), // Tương ứng với varchar(255)
            allowNull: false // Không được phép null
        }
    },
    {
        tableName: 'permissions', // Tên bảng trong MySQL
        timestamps: false // Không sử dụng createdAt/updatedAt mặc định của Sequelize
    }
);

// Export model Permissions
module.exports = Permissions;
