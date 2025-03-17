'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('taxes', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING
            },
            percentage: {
                type: Sequelize.STRING
            },
            is_default: {
                type: Sequelize.INTEGER
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
        await queryInterface.dropTable('taxes');
    }
};
