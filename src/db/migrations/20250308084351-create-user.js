'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', {
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
            email: {
                type: Sequelize.STRING
            },
            address: {
                type: Sequelize.TEXT
            },
            email_verified_at: {
                type: Sequelize.DATE
            },
            password: {
                type: Sequelize.STRING
            },
            avatar: {
                type: Sequelize.STRING
            },
            parent_id: {
                type: Sequelize.INTEGER
            },
            type: {
                type: Sequelize.STRING
            },
            branch_id: {
                type: Sequelize.INTEGER
            },
            cash_register_id: {
                type: Sequelize.INTEGER
            },
            lang: {
                type: Sequelize.STRING
            },
            mode: {
                type: Sequelize.STRING
            },
            plan_id: {
                type: Sequelize.INTEGER
            },
            plan_expire_date: {
                type: Sequelize.DATE
            },
            plan_requests: {
                type: Sequelize.INTEGER
            },
            is_active: {
                type: Sequelize.INTEGER
            },
            user_status: {
                type: Sequelize.INTEGER
            },
            remember_token: {
                type: Sequelize.STRING
            },
            created_at: {
                type: Sequelize.DATE
            },
            updated_at: {
                type: Sequelize.DATE
            },
            last_login_at: {
                type: Sequelize.DATE
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            deletedAt: {
                type: Sequelize.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('users');
    }
};
