'use strict';
const { DataTypes } = require('sequelize');

const sequelize = require('../../config/database');
const AppError = require('../../utils/appError');

const Brand = sequelize.define(
    'Brand',
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
        slug: {
            type: DataTypes.STRING
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
        modelName: 'Brand',
        tableName: 'brands', // Chỉ định rõ tên bảng
        timestamps: false, // Tắt tự động quản lý timestamps vì bạn tự quản lý createAt
        underscored: false // Giữ nguyên tên cột có dấu gạch dưới (ví dụ: userId, refreshToken)
    }
);

module.exports = Brand;
