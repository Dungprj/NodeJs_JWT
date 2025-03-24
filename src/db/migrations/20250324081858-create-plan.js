'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('plans', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            id: {
                type: Sequelize.BIGINT
            },
            name: {
                type: Sequelize.STRING
            },
            price: {
                type: Sequelize.DOUBLE
            },
            duration: {
                type: Sequelize.STRING
            },
            max_users: {
                type: Sequelize.INTEGER
            },
            max_customers: {
                type: Sequelize.INTEGER
            },
            max_vendors: {
                type: Sequelize.INTEGER
            },
            description: {
                type: Sequelize.TEXT
            },
            created_at: {
                type: Sequelize.DATE
            },
            updated_at: {
                type: Sequelize.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('plans');
    }
};
