'use strict';
const { DataTypes } = require('sequelize');

const sequelize = require('../../config/database');
const AppError = require('../../utils/appError');
const User = require('./user');
const Product = require('./product');
const Tax = require('./tax');

const InvoicePurchase = require('./invoicePurchase');
const InvoicePurchaseDetail = sequelize.define(
    'InvoicePurchaseDetail',
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        purchase_id: {
            type: DataTypes.INTEGER
        },
        product_id: {
            type: DataTypes.INTEGER
        },
        price: {
            type: DataTypes.DOUBLE
        },
        quantity: {
            type: DataTypes.INTEGER
        },
        tax_id: {
            type: DataTypes.INTEGER
        },
        tax: {
            type: DataTypes.DOUBLE
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
        modelName: 'InvoicePurchaseDetail',
        tableName: 'purchased_items', // Chỉ định rõ tên bảng
        timestamps: true, // Bật tự động quản lý timestamps
        createdAt: 'created_at', // Đổi tên cột createdAt mặc định
        updatedAt: 'updated_at', // Đổi tên cột updatedAt mặc định
        underscored: false // Giữ nguyên tên cột có dấu gạch dưới (ví dụ: userId, refreshToken)
    }
);

// Định nghĩa mối quan hệ
InvoicePurchaseDetail.belongsTo(InvoicePurchase, {
    foreignKey: 'purchase_id',
    as: 'invoice'
});

InvoicePurchaseDetail.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
});

// Định nghĩa mối quan hệ ngược từ InvoicePurchase
InvoicePurchase.hasMany(InvoicePurchaseDetail, {
    foreignKey: 'purchase_id',
    as: 'details'
});

// Thêm ràng buộc UNIQUE trên cặp purchase_id và product_id
InvoicePurchaseDetail.addHook('beforeCreate', async (detail, options) => {
    const existingDetail = await InvoicePurchaseDetail.findOne({
        where: {
            purchase_id: detail.purchase_id,
            product_id: detail.product_id
        },
        transaction: options.transaction
    });
    if (existingDetail) {
        throw new AppError('Sản phẩm đã tồn tại trong hóa đơn này', 400);
    }
});

module.exports = InvoicePurchaseDetail;
