'use strict';
const { DataTypes } = require('sequelize');

const sequelize = require('../../config/database');
const AppError = require('../../utils/appError');

const Unit = sequelize.define(
    'Unit',
    {},
    {
        freezeTableName: true,
        modelName: 'Unit',
        tableName: 'Unit', // Chỉ định rõ tên bảng
        timestamps: false, // Tắt tự động quản lý timestamps vì bạn tự quản lý createAt
        underscored: false // Giữ nguyên tên cột có dấu gạch dưới (ví dụ: userId, refreshToken)
    }
);

module.exports = Unit;
