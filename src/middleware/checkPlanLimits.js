const catchAsync = require('../utils/catchAsync');
const planService = require('../services/admin/plan/planService');
const AppError = require('../utils/appError');

const checkPlanLimits = {
    // user: catchAsync(async (req, res, next) => {
    //     // Kiểm tra giới hạn về số người dùng của plan hiện tại
    // }),
    // customer: catchAsync(async (req, res, next) => {
    //     // Kiểm tra giới hạn về số khách hàng của plan hiện tại
    // }),
    // vendor: catchAsync(async (req, res, next) => {
    //     // Kiểm tra giới hạn về số nhà cung cấp của plan hiện tại
    //     //trả về true hoặc false bằng cách so sánh số nhà cung cấp <= limit
    // })
};

module.exports = checkPlanLimits;
