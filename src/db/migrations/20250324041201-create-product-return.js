'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('products_returns', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            date: {
                type: Sequelize.DATE
            },
            reference_no: {
                type: Sequelize.STRING
            },
            vendor_id: {
                type: Sequelize.INTEGER
            },
            customer_id: {
                type: Sequelize.INTEGER
            },
            return_note: {
                type: Sequelize.TEXT
            },
            staff_note: {
                type: Sequelize.TEXT
            },
            created_by: {
                type: Sequelize.INTEGER
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
        await queryInterface.dropTable('products_returns');
    }
};
