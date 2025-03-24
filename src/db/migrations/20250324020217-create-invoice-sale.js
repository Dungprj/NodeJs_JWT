'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('sales', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            invoice_id: {
                type: Sequelize.STRING
            },
            customer_id: {
                type: Sequelize.INTEGER
            },
            branch_id: {
                type: Sequelize.INTEGER
            },
            cash_register_id: {
                type: Sequelize.INTEGER
            },
            status: {
                type: Sequelize.TINYINT
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
        await queryInterface.dropTable('sales');
    }
};
