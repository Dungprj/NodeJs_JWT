require('dotenv').config();
const Plan = require('../../../db/models/plan');
const AppError = require('../../../utils/appError');

const planService = {
    // Lấy tất cả plan của user (200 OK | 404 Not Found)
    getAllPlans: async user => {
        const plans = await Plan.findAll();

        if (!plans || plans.length === 0) {
            throw new AppError('Danh sách plan không tồn tại', 404);
        }

        return plans;
    },

    // Lấy thông tin plan theo ID (200 OK | 404 Not Found)
    getPlanById: async id => {
        const plan = await Plan.findByPk(id);
        if (!plan) {
            throw new AppError('Không tìm thấy plan', 404);
        }
        return plan;
    }
};

module.exports = planService;
