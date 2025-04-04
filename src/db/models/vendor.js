'use strict';
const { DataTypes } = require('sequelize');

const sequelize = require('../../config/database');
const AppError = require('../../utils/appError');

const Vendor = sequelize.define(
    'Vendor',
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        name: {
            allowNull: false,
            type: DataTypes.STRING
        },
        email: {
            allowNull: false,
            type: DataTypes.STRING
        },
        phone_number: {
            allowNull: false,
            type: DataTypes.STRING
        },
        address: {
            type: DataTypes.TEXT
        },
        city: {
            type: DataTypes.STRING
        },
        state: {
            type: DataTypes.STRING
        },
        country: {
            type: DataTypes.STRING
        },
        zipcode: {
            type: DataTypes.STRING
        },
        is_active: {
            allowNull: false,
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        created_by: {
            allowNull: false,
            type: DataTypes.INTEGER,
            defaultValue: 0
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
        modelName: 'Vendor',
        tableName: 'vendors', // Chỉ định rõ tên bảng
        timestamps: true, // Bật tự động quản lý timestamps
        createdAt: 'created_at', // Đổi tên cột createdAt mặc định
        updatedAt: 'updated_at', // Đổi tên cột updatedAt mặc định
        underscored: false // Giữ nguyên tên cột có dấu gạch dưới (ví dụ: userId, refreshToken)
    }
);

module.exports = Vendor;
