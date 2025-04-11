'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('expenses', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },

            date: {
                type: Sequelize.DATE
            },
            branchId: {
                type: Sequelize.INTEGER
            },
            category_id: {
                type: Sequelize.INTEGER
            },
            amount: {
                type: Sequelize.DOUBLE
            },
            note: {
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
        await queryInterface.dropTable('expenses');
    }
};
