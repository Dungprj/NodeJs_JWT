'use strict';
const { DataTypes } = require('sequelize');

const sequelize = require('../../config/database');
const AppError = require('../../utils/appError');
const User = require('./user');
const Tax = require('./tax');
const Unit = require('./unit');
const Category = require('./category');
const Brand = require('./brand');
const Product = sequelize.define(
    'Product',
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.BIGINT.UNSIGNED
        },
        name: {
            type: DataTypes.STRING(191),
            allowNull: false
        },
        slug: {
            type: DataTypes.STRING(191),
            allowNull: false
        },
        sku: {
            type: DataTypes.STRING(191),
            allowNull: true
        },
        purchase_price: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        sale_price: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        tax_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Tax',
                key: 'id'
            },
            defaultValue: 0,
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        },
        unit_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Unit',
                key: 'id'
            },
            defaultValue: 0,
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Category',
                key: 'id'
            },
            defaultValue: 0,
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        },
        brand_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Brand',
                key: 'id'
            },
            defaultValue: 0,
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        },
        image: {
            type: DataTypes.STRING(191),
            allowNull: true
        },
        product_type: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'User',
                key: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        }
    },
    {
        freezeTableName: true,
        modelName: 'Product',
        tableName: 'products', // Chỉ định rõ tên bảng
        timestamps: true, // Bật tự động quản lý timestamps
        createdAt: 'created_at', // Đổi tên cột createdAt mặc định
        updatedAt: 'updated_at', // Đổi tên cột updatedAt mặc định
        underscored: false // Giữ nguyên tên cột có dấu gạch dưới (ví dụ: userId, refreshToken)
    }
);

// **THÊM QUAN HỆ (ASSOCIATIONS) CHO MODEL**
Product.belongsTo(Tax, { foreignKey: 'tax_id', as: 'tax' });
Product.belongsTo(Unit, { foreignKey: 'unit_id', as: 'unit' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Product.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' });

// Quan hệ với User
Product.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

module.exports = Product;
