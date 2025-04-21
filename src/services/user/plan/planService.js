require('dotenv').config();
const Plan = require('../../../db/models/plan');

const User = require('../../../db/models/user');

const commom = require('../../../common/common');

const AppError = require('../../../utils/appError');
const paymenttransactionService = require('../PaymentTransaction/paymentTransaction');

const planService = {
    // Lấy tất cả plan của user (200 OK | 404 Not Found)
    getAllPlans: async user => {
        const plans = await Plan.findAll();

        if (!plans) {
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
    },
    getDateExpire: async idQuery => {
        const getLastPayment = await paymenttransactionService.getPlanLastest(
            idQuery
        );

        console.log('goi dang ky cuoi cung thanh cong la : ', getLastPayment);

        let planIdCurrent = 1;

        //planCurrent mac dinh la 1

        let planCurrent = await Plan.findByPk(planIdCurrent);

        if (getLastPayment == null) {
            console.log('Khong tim thấy thông tin thanh toán gần nhất');
            console.log('đang dùng gói free');

            const userCurent = await User.findByPk(idQuery);

            const calcPlanExpire = commom.calculateEndTime(
                userCurent.created_at,
                planCurrent.duration
            );

            return calcPlanExpire;
        }

        planCurrent = getLastPayment.plan_id;
        console.log('dung goi vip : ', getLastPayment.plan_id);

        planCurrent = await Plan.findByPk(getLastPayment.plan_id);

        const calcPlanExpire = commom.calculateEndTime(
            getLastPayment.created_at,
            planCurrent.duration
        );

        return calcPlanExpire;
    }
};

module.exports = planService;
