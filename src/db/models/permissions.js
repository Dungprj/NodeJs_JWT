'use strict';
const { DataTypes } = require('sequelize');

const sequelize = require('../../config/database');
const AppError = require('../../utils/appError');

const Role = require('./roles');

const Permission = sequelize.define(
    'Permission',
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        name: {
            type: DataTypes.STRING
        },
        guard_name: {
            type: DataTypes.STRING
        },
        created_at: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updated_at: {
            allowNull: false,
            type: DataTypes.DATE
        }
    },
    {
        modelName: 'Permission',
        tableName: 'permissions', // Chỉ định rõ tên bảng
        timestamps: false, // Tắt tự động quản lý timestamps vì bạn tự quản lý createAt
        underscored: true // Giữ nguyên tên cột có dấu gạch dưới (ví dụ: userId, refreshToken)
    }
);

Permission.belongsToMany(Role, {
    through: 'role_has_permissions', // Tên bảng trung gian
    foreignKey: 'permission_id', // Khóa ngoại trong bảng role_permissions trỏ đến Permissions
    otherKey: 'role_id', // Khóa ngoại trỏ đến Roles
    as: 'Permission_roles' // Tên alias cho quan hệ (tùy chọn)
});

Role.belongsToMany(Permission, {
    through: 'role_has_permissions', // Tên bảng trung gian
    foreignKey: 'role_id', // Khóa ngoại trong bảng role_permissions trỏ đến Permissions
    otherKey: 'permission_id', // Khóa ngoại trỏ đến Roles
    as: 'Role_Permission', // Tên alias cho quan hệ (tùy chọn)
    onDelete: 'CASCADE'
});
module.exports = Permission;
