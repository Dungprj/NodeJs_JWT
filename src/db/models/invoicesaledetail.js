'use strict';
const { DataTypes } = require('sequelize');

const sequelize = require('../../config/database');
const AppError = require('../../utils/appError');
const InvoiceSale = require('./invoicesale');
const Product = require('./product');
const InvoiceSaleDetail = sequelize.define(
    'InvoiceSaleDetail',
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        sell_id: {
            type: DataTypes.INTEGER
        },
        product_id: {
            type: DataTypes.INTEGER
        },
        price: {
            type: DataTypes.DECIMAL
        },
        quantity: {
            type: DataTypes.DECIMAL
        },
        tax_id: {
            type: DataTypes.INTEGER
        },
        tax: {
            type: DataTypes.DECIMAL
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
        modelName: 'InvoiceSaleDetail',
        tableName: 'selled_items', // Chỉ định rõ tên bảng
        timestamps: true, // Bật tự động quản lý timestamps
        createdAt: 'created_at', // Đổi tên cột createdAt mặc định
        updatedAt: 'updated_at', // Đổi tên cột updatedAt mặc định
        underscored: false // Giữ nguyên tên cột có dấu gạch dưới (ví dụ: userId, refreshToken)
    }
);

// Định nghĩa mối quan hệ ngược từ InvoicePurchase
InvoiceSale.hasMany(InvoiceSaleDetail, {
    foreignKey: 'sell_id',
    as: 'details'
});

InvoiceSaleDetail.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
});

module.exports = InvoiceSaleDetail;
