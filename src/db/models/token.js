'use strict';
const { DataTypes } = require('sequelize');

const sequelize = require('../../config/database');
const AppError = require('../../utils/appError');

const Token = sequelize.define(
    'Token',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'userId' // Đảm bảo ánh xạ đúng với tên cột trong database
        },
        refreshToken: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'refreshToken'
        },
        accessToken: {
            type: DataTypes.STRING
        },
        refreshExpireAt: {
            type: DataTypes.DATE
        },
        accessExpireAt: {
            type: DataTypes.DATE
        },

        refreshIsValid: {
            allowNull: false,
            type: DataTypes.INTEGER,
            defaultValue: 1
        },
        accessIsValid: {
            allowNull: false,
            type: DataTypes.INTEGER,
            defaultValue: 1
        },

        createdAt: {
            allowNull: true,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: true,
            type: DataTypes.DATE
        }
    },
    {
        freezeTableName: true,
        modelName: 'Token',
        tableName: 'Token', // Chỉ định rõ tên bảng
        timestamps: false, // Tắt tự động quản lý timestamps vì bạn tự quản lý createAt
        underscored: false // Giữ nguyên tên cột có dấu gạch dưới (ví dụ: userId, refreshToken)
    }
);

module.exports = Token;
