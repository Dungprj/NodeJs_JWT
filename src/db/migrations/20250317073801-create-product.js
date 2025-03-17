'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('products', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT.UNSIGNED
            },
            name: {
                type: Sequelize.STRING(191),
                allowNull: false
            },
            slug: {
                type: Sequelize.STRING(191),
                allowNull: false
            },
            sku: {
                type: Sequelize.STRING(191),
                allowNull: true
            },
            purchase_price: {
                type: Sequelize.DOUBLE,
                allowNull: false,
                defaultValue: 0
            },
            sale_price: {
                type: Sequelize.DOUBLE,
                allowNull: false,
                defaultValue: 0
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            tax_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'taxes',
                    key: 'id'
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE'
            },
            unit_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'units',
                    key: 'id'
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE'
            },
            category_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'categories',
                    key: 'id'
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE'
            },
            brand_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'brands',
                    key: 'id'
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE'
            },
            image: {
                type: Sequelize.STRING(191),
                allowNull: true
            },
            product_type: {
                type: Sequelize.TINYINT,
                allowNull: false,
                defaultValue: 0
            },
            created_by: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: Sequelize.NOW
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: Sequelize.NOW
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('products');
    }
};
