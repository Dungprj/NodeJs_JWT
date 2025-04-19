'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PaymentTransactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      order_id: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      card_number: {
        type: Sequelize.STRING
      },
      card_exp_month: {
        type: Sequelize.STRING
      },
      card_exp_year: {
        type: Sequelize.STRING
      },
      plan_name: {
        type: Sequelize.STRING
      },
      plan_id: {
        type: Sequelize.INTEGER
      },
      price: {
        type: Sequelize.DOUBLE
      },
      price_currency: {
        type: Sequelize.STRING
      },
      txn_id: {
        type: Sequelize.STRING
      },
      payment_type: {
        type: Sequelize.STRING
      },
      payment_status: {
        type: Sequelize.STRING
      },
      receipt: {
        type: Sequelize.STRING
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      created_at: {
        type: Sequelize.DATE
      },
      updated_at: {
        type: Sequelize.DATE
      },
      vnp_ip: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('PaymentTransactions');
  }
};