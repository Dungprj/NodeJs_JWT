'use strict';
const { DataTypes } = require('sequelize');

const User = require('./user');
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
        timestamps: true, // Bật tự động quản lý timestamps
        createdAt: 'created_at', // Đổi tên cột createdAt mặc định
        updatedAt: 'updated_at', // Đổi tên cột updatedAt mặc định
        underscored: false // Giữ nguyên tên cột có dấu gạch dưới (ví dụ: userId, refreshToken)
    }
);

// Quan hệ với User
Brand.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

module.exports = Brand;
