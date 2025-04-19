const Plan = require('../db/models/plan');
const paymenttransactionService = require('../services/user/PaymentTransaction/paymentTransaction');

const commom = require('../common/common');

const AppError = require('../utils/appError');

const checkPlanExpire = async (req, res, next) => {
    let idQuery = req.idQuery;

    const getLastPayment = await paymenttransactionService.getPlanLastest(
        idQuery
    );

    const planCurrent = await Plan.findByPk(getLastPayment.plan_id);

    const calcPlanExpire = commom.calculateEndTime(
        getLastPayment.created_at,
        planCurrent.duration
    );

    if (calcPlanExpire < new Date()) {
        return next(
            new AppError(
                'Hết hạn plan vui lòng đăng ký gói mới để tiếp tục',
                400
            )
        );
    }
    console.log('Thời gian hết hạn là : ', calcPlanExpire);
    console.log('Vẵn còn hạn');

    next();
};

module.exports = checkPlanExpire;
