'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Tokens', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            id: {
                type: Sequelize.INTEGER
            },
            userId: {
                type: Sequelize.INTEGER
            },
            refreshToken: {
                type: Sequelize.STRING
            },
            accessToken: {
                type: Sequelize.STRING
            },
            refreshExpireAt: {
                type: Sequelize.DATE
            },
            accessExpireAt: {
                type: Sequelize.DATE
            },
            refreshIsValid: {
                type: DataTypes.INTEGER
            },
            accessIsValid: {
                type: DataTypes.INTEGER
            },
            createAt: {
                type: Sequelize.DATE
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Tokens');
    }
};
