'use strict';
const { DataTypes } = require('sequelize');

const sequelize = require('../../config/database');
const AppError = require('../../utils/appError');
const User = require('./user');
const Customer = require('./customer');
const Branch = require('./branch');
const CashRegister = require('./cashregister');

const InvoiceSale = sequelize.define(
    'InvoiceSale',
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        invoice_id: {
            allowNull: false,
            type: DataTypes.STRING
        },
        customer_id: {
            allowNull: false,
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        branch_id: {
            allowNull: false,
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        cash_register_id: {
            allowNull: false,
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        paied: {
            allowNull: true,
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },

        status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            validate: {
                isIn: {
                    args: [[0, 1, 2]],
                    msg: 'Giá trị status phải là 0, 1 hoặc 2'
                }
            }
        },
        created_by: {
            allowNull: false,
            type: DataTypes.INTEGER,
            defaultValue: 0
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
        modelName: 'InvoiceSale',
        tableName: 'sales', // Chỉ định rõ tên bảng
        timestamps: true, // Bật tự động quản lý timestamps
        createdAt: 'created_at', // Đổi tên cột createdAt mặc định
        updatedAt: 'updated_at', // Đổi tên cột updatedAt mặc định
        underscored: false // Giữ nguyên tên cột có dấu gạch dưới (ví dụ: userId, refreshToken)
    }
);

// // Định nghĩa mối quan hệ
InvoiceSale.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'User'
});

// // Định nghĩa mối quan hệ
InvoiceSale.belongsTo(Customer, {
    foreignKey: 'customer_id',
    as: 'Customer'
});

InvoiceSale.belongsTo(Branch, {
    foreignKey: 'branch_id',
    as: 'branch'
});

InvoiceSale.belongsTo(CashRegister, {
    foreignKey: 'cash_register_id',
    as: 'cashRegister'
});

// InvoicePurchase.belongsTo(User, {
//     foreignKey: 'created_by',
//     as: 'creator'
// });

// // Thêm ràng buộc UNIQUE trên cặp invoice_id và created_by
// InvoicePurchase.addHook('beforeCreate', async (invoice, options) => {
//     const existingInvoice = await InvoicePurchase.findOne({
//         where: {
//             invoice_id: invoice.invoice_id,
//             created_by: invoice.created_by
//         },
//         transaction: options.transaction
//     });
//     if (existingInvoice) {
//         throw new AppError('Mã hóa đơn đã tồn tại cho người dùng này', 400);
//     }
// });

module.exports = InvoiceSale;
