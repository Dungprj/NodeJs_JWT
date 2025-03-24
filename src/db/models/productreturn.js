'use strict';
const { DataTypes } = require('sequelize');

const sequelize = require('../../config/database');
const AppError = require('../../utils/appError');
const User = require('./user');
const ProductReturn = sequelize.define(
    'ProductReturn',
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        date: {
            type: DataTypes.DATE
        },
        reference_no: {
            type: DataTypes.STRING
        },
        vendor_id: {
            type: DataTypes.INTEGER
        },
        customer_id: {
            type: DataTypes.INTEGER
        },
        return_note: {
            type: DataTypes.TEXT
        },
        staff_note: {
            type: DataTypes.TEXT
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
        modelName: 'ProductReturn',
        tableName: 'products_returns', // Chỉ định rõ tên bảng
        timestamps: true, // Bật tự động quản lý timestamps
        createdAt: 'created_at', // Đổi tên cột createdAt mặc định
        updatedAt: 'updated_at', // Đổi tên cột updatedAt mặc định
        underscored: false // Giữ nguyên tên cột có dấu gạch dưới (ví dụ: userId, refreshToken)
    }
);

module.exports = ProductReturn;
