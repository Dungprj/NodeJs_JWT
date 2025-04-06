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
        timestamps: true, // Bật tự động quản lý timestamps
        createdAt: 'created_at', // Đổi tên cột createdAt mặc định
        updatedAt: 'updated_at', // Đổi tên cột updatedAt mặc định
        underscored: false // Giữ nguyên tên cột có dấu gạch dưới (ví dụ: userId, refreshToken)
    }
);

// // Quan hệ với User
// Unit.belongsTo(User, {
//     foreignKey: 'created_by',
//     as: 'creatorbyUser',
//     onDelete: 'CASCADE',
//     onUpdate: 'CASCADE'
// });

module.exports = Unit;
