require('dotenv').config();
const Plan = require('../../../db/models/plan');
const PaymentTransaction = require('../../../db/models/paymenttransaction');

const { Op } = require('sequelize');
const AppError = require('../../../utils/appError');
const commom = require('../../../common/common');
const paymenttransactionService = {
    // Lấy thông tin chi nhánh theo ID (200 OK | 404 Not Found)
    getPlanLastest: async user_id => {
        const payMentTransaction = await PaymentTransaction.findOne({
            where: { user_id: user_id, payment_status: 'success' },
            order: [['created_at', 'DESC']]
        });
        if (!payMentTransaction) {
            throw new AppError('Không tìm thấy yêu cầu gói nào', 404);
        }

        console.log(
            'danh sach goi dang ky ---------------: ',
            payMentTransaction
        );
        return payMentTransaction;
    }
};

module.exports = paymenttransactionService;
