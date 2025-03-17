'use strict';
const { DataTypes, Sequelize } = require('sequelize');

const sequelize = require('../../config/database');
const AppError = require('../../utils/appError');

const Unit = sequelize.define(
    'Unit',
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.BIGINT
        },
        name: {
            allowNull: false,
            type: DataTypes.STRING
        },
        shortname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        created_by: {
            allowNull: false,
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
        modelName: 'Unit',
        tableName: 'units', // Chỉ định rõ tên bảng
        timestamps: false, // Tắt tự động quản lý timestamps vì bạn tự quản lý createAt
        underscored: false // Giữ nguyên tên cột có dấu gạch dưới (ví dụ: userId, refreshToken)
    }
);

module.exports = Unit;
