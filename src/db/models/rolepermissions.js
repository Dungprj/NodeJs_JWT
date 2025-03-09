'use strict';
const { DataTypes } = require('sequelize');

const sequelize = require('../../config/database');
const AppError = require('../../utils/appError');

const RolePermission = sequelize.define(
    'RolePermission',
    {
        permission_id: {
            type: DataTypes.INTEGER
        },
        role_id: {
            type: DataTypes.INTEGER
        }
    },
    {
        modelName: 'RolePermission',
        tableName: 'role_has_permissions', // Chỉ định rõ tên bảng
        timestamps: false, // Tắt tự động quản lý timestamps vì bạn tự quản lý createAt
        underscored: true // Giữ nguyên tên cột có dấu gạch dưới (ví dụ: userId, refreshToken)
    }
);

module.exports = RolePermission;
