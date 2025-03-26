const catchAsync = require('../utils/catchAsync');
const planService = require('../services/admin/plan/planService');
const AppError = require('../utils/appError');

const User = require('../db/models/user');
const Plan = require('../db/models/plan');
const Vendor = require('../db/models/vendor');

const getPlanCurrent = async id => {
    const user = await User.findByPk(id);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    const plan = await Plan.findByPk(user.plan_id);
    if (!plan) {
        throw new AppError('Plan not found', 404);
    }

    console.log('plan ------', plan);

    return plan;
};

const checkPlanLimits = {
    // lay plan
    // user: catchAsync(async (req, res, next) => {
    //     // Kiểm tra giới hạn về số người dùng của plan hiện tại
    // }),
    // customer: catchAsync(async (req, res, next) => {
    //     // Kiểm tra giới hạn về số khách hàng của plan hiện tại
    // }),
    vendor: catchAsync(async (req, res, next) => {
        try {
            // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
            const transaction = await Vendor.sequelize.transaction();
            // Kiểm tra giới hạn về số nhà cung cấp của plan hiện tại
            const plan = await getPlanCurrent(req.user.id);
            const quantityVendorCurrent = await Vendor.findAll({
                where: {
                    created_by: req.idQuery
                },
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (quantityVendorCurrent.length < plan.max_vendors) {
                await transaction.commit();
                next();
            } else {
                return next(
                    new AppError('Bạn đã đạt giới hạn về số nhà cung cấp', 400)
                );
            }
        } catch (err) {
            await transaction.rollback();
            return next(new AppError(err));
        }

        //trả về true hoặc false bằng cách so sánh số nhà cung cấp <= limit
    })
};

module.exports = checkPlanLimits;
