'use strict';
const { DataTypes } = require('sequelize');

const sequelize = require('../../config/database');
const AppError = require('../../utils/appError');
const User = require('./user');
const CastRegister = require('./cashregister');
const commom = require('../../common/common');
const Branch = sequelize.define(
    'Branch',
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
        branch_type: {
            type: DataTypes.ENUM('Retail', 'Restaurant'),
            allowNull: true
        },
        branch_manager: {
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
        modelName: 'Branch',
        tableName: 'branches', // Chỉ định rõ tên bảng
        timestamps: true, // Bật tự động quản lý timestamps
        createdAt: 'created_at', // Đổi tên cột createdAt mặc định
        updatedAt: 'updated_at', // Đổi tên cột updatedAt mặc định
        underscored: false // Giữ nguyên tên cột có dấu gạch dưới (ví dụ: userId, refreshToken)
    }
);

Branch.hasMany(CastRegister, {
    foreignKey: 'branch_id',
    as: 'branchCashRegister'
});

Branch.belongsTo(User, {
    foreignKey: 'branch_manager',
    as: 'BranchUser'
});

CastRegister.belongsTo(Branch, {
    foreignKey: 'branch_id',
    as: 'cash_register_branch',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// Quan hệ với User
Branch.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

module.exports = Branch;
