'use strict';
const { DataTypes } = require('sequelize');

const sequelize = require('../../config/database');
const AppError = require('../../utils/appError');
const User = require('./user');

const Role = sequelize.define(
    'Role',
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
        created_by: {
            type: DataTypes.BIGINT,
            references: {
                model: 'User',
                key: 'id'
            }
            // onDelete: 'CASCADE'
        },
        guard_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        created_at: {
            allowNull: true,
            type: DataTypes.DATE
        },
        updated_at: {
            allowNull: true,
            type: DataTypes.DATE
        }
    },
    {
        modelName: 'Role',
        tableName: 'roles', // Chỉ định rõ tên bảng
        timestamps: false, // Tắt tự động quản lý timestamps vì bạn tự quản lý createAt
        underscored: true // Giữ nguyên tên cột có dấu gạch dưới (ví dụ: userId, refreshToken)
    }
);

module.exports = Role;
