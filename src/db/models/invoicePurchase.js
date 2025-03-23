'use strict';
const { DataTypes } = require('sequelize');

const sequelize = require('../../config/database');
const AppError = require('../../utils/appError');
const User = require('./user');
const Vendor = require('./vendor'); // Giả định bạn đã có model Vendor
const Branch = require('./branch'); // Giả định bạn đã có model Branch
const CashRegister = require('./cashregister'); // Giả định bạn đã có model CashRegister

const InvoicePurchase = sequelize.define(
    'InvoicePurchase',
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.BIGINT.UNSIGNED // Sửa thành BIGINT.UNSIGNED
        },
        invoice_id: {
            type: DataTypes.STRING(50), // Giới hạn độ dài 50
            allowNull: false, // NOT NULL
            collate: 'utf8mb4_unicode_ci' // Hỗ trợ ký tự Unicode
        },
        vendor_id: {
            type: DataTypes.INTEGER,
            allowNull: false, // NOT NULL
            defaultValue: 0 // DEFAULT 0
        },
        branch_id: {
            type: DataTypes.INTEGER,
            allowNull: false, // NOT NULL
            defaultValue: 0 // DEFAULT 0
        },
        cash_register_id: {
            type: DataTypes.INTEGER,
            allowNull: false, // NOT NULL
            defaultValue: 0 // DEFAULT 0
        },
        status: {
            type: DataTypes.ENUM(0, 1, 2),
            allowNull: false, // NOT NULL
            defaultValue: 0 // DEFAULT 0
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false, // NOT NULL
            defaultValue: 0 // DEFAULT 0
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true // NULL
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true // NULL
        }
    },
    {
        freezeTableName: true,
        modelName: 'InvoicePurchase',
        tableName: 'purchases', // Chỉ định rõ tên bảng
        timestamps: true, // Bật tự động quản lý timestamps
        createdAt: 'created_at', // Đổi tên cột createdAt mặc định
        updatedAt: 'updated_at', // Đổi tên cột updatedAt mặc định
        underscored: false // Giữ nguyên tên cột có dấu gạch dưới
    }
);

// Định nghĩa mối quan hệ
InvoicePurchase.belongsTo(Vendor, {
    foreignKey: 'vendor_id',
    as: 'vendor'
});

InvoicePurchase.belongsTo(Branch, {
    foreignKey: 'branch_id',
    as: 'branch'
});

InvoicePurchase.belongsTo(CashRegister, {
    foreignKey: 'cash_register_id',
    as: 'cashRegister'
});

InvoicePurchase.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator'
});

// Thêm ràng buộc UNIQUE trên cặp invoice_id và created_by
InvoicePurchase.addHook('beforeCreate', async (invoice, options) => {
    const existingInvoice = await InvoicePurchase.findOne({
        where: {
            invoice_id: invoice.invoice_id,
            created_by: invoice.created_by
        },
        transaction: options.transaction
    });
    if (existingInvoice) {
        throw new AppError('Mã hóa đơn đã tồn tại cho người dùng này', 400);
    }
});

module.exports = InvoicePurchase;
