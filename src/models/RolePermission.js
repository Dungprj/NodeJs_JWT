const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Kết nối sequelize
const Role = require('./Role'); // Model Role
const Permissions = require('./Permission'); // Model Permissions

// Định nghĩa bảng trung gian role_permissions
const RolePermissions = sequelize.define(
    'RolePermissions',
    {
        roleId: {
            type: DataTypes.INTEGER,
            references: {
                model: Role, // Tham chiếu đến model Role
                key: 'id' // Khoá chính của bảng Role
            },
            allowNull: false
        },
        permissionId: {
            type: DataTypes.INTEGER,
            references: {
                model: Permissions, // Tham chiếu đến model Permissions
                key: 'id' // Khoá chính của bảng Permissions
            },
            allowNull: false
        }
    },
    {
        tableName: 'role_permissions', // Tên bảng trong MySQL
        timestamps: false // Không sử dụng createdAt/updatedAt
    }
);

// Thiết lập mối quan hệ giữa các bảng
Role.belongsToMany(Permissions, {
    through: RolePermissions,
    foreignKey: 'roleId'
});
Permissions.belongsToMany(Role, {
    through: RolePermissions,
    foreignKey: 'permissionId'
});

module.exports = RolePermissions;
