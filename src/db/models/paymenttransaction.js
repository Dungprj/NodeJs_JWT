// PaymentTransaction

'use strict';
const { DataTypes } = require('sequelize');

const sequelize = require('../../config/database');
const AppError = require('../../utils/appError');

const PaymentTransaction = sequelize.define(
    'PaymentTransaction',
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        order_id: {
            type: DataTypes.STRING
        },
        name: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING
        },
        card_number: {
            type: DataTypes.STRING
        },
        card_exp_month: {
            type: DataTypes.STRING
        },
        card_exp_year: {
            type: DataTypes.STRING
        },
        plan_name: {
            type: DataTypes.STRING
        },
        plan_id: {
            type: DataTypes.INTEGER
        },
        price: {
            type: DataTypes.DOUBLE
        },
        price_currency: {
            type: DataTypes.STRING
        },
        txn_id: {
            type: DataTypes.STRING
        },
        payment_type: {
            type: DataTypes.STRING
        },
        payment_status: {
            type: DataTypes.STRING
        },
        receipt: {
            type: DataTypes.STRING
        },
        user_id: {
            type: DataTypes.INTEGER
        },
        created_at: {
            type: DataTypes.DATE
        },
        updated_at: {
            type: DataTypes.DATE
        },
        vnp_ip: {
            type: DataTypes.STRING
        }
    },
    {
        freezeTableName: true,
        modelName: 'PaymentTransaction',
        tableName: 'orders', // Chỉ định rõ tên bảng
        timestamps: true, // Bật tự động quản lý timestamps
        createdAt: 'created_at', // Đổi tên cột createdAt mặc định
        updatedAt: 'updated_at', // Đổi tên cột updatedAt mặc định
        underscored: false // Giữ nguyên tên cột có dấu gạch dưới (ví dụ: userId, refreshToken)
    }
);

module.exports = PaymentTransaction;
