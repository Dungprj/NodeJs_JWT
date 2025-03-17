'use strict';
const { DataTypes } = require('sequelize');

const sequelize = require('../../config/database');
const AppError = require('../../utils/appError');

const Tax = sequelize.define(
    'Tax',
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
        percentage: {
            type: DataTypes.STRING
        },
        is_default: {
            type: DataTypes.INTEGER
        },
        created_by: {
            type: DataTypes.INTEGER
        },
        created_at: {
            type: DataTypes.DATE
        },
        updated_at: {
            type: DataTypes.DATE
        }
    },
    {
        freezeTableName: true,
        modelName: 'Tax',
        tableName: 'taxes', // Chỉ định rõ tên bảng
        timestamps: false, // Tắt tự động quản lý timestamps vì bạn tự quản lý createAt
        underscored: false // Giữ nguyên tên cột có dấu gạch dưới (ví dụ: userId, refreshToken)
    }
);

module.exports = Tax;
