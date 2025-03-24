const catchAsync = require('../utils/catchAsync');
const planService = require('../services/admin/plan/planService');
const AppError = require('../utils/appError');

const checkPlanLimits = catchAsync(async (req, res, next) => {
    // Kiểm tra giới hạn của plan hiện tại
    const plan = await planService.getPlanById(1);

    console.log('plan la : ', plan);

    next();
});

module.exports = checkPlanLimits;
