const catchAsync = require('../utils/catchAsync');
const planService = require('../services/admin/plan/planService');
const AppError = require('../utils/appError');

const User = require('../db/models/user');
const Plan = require('../db/models/plan');
const Vendor = require('../db/models/vendor');
const Customer = require('../db/models/customer');

const getPlanCurrent = async id => {
    const user = await User.findByPk(id);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    const plan = await Plan.findByPk(user.plan_id);
    if (!plan) {
        throw new AppError('Plan not found', 404);
    }

    return plan;
};

const checkPlanLimits = {
    customer: catchAsync(async (req, res, next) => {
        try {
            const idQuery = req.idQuery;
            const transaction = await Customer.sequelize.transaction();
            const plan = await getPlanCurrent(idQuery);
            if (plan.max_customers != -1) {
                // Khóa bảng User để ngăn các giao dịch khác thay đổi dữ liệu trong suốt quá trình này

                const customerCount = await Customer.count({
                    where: { created_by: idQuery },
                    transaction,
                    //khóa các record liên quan đến điều kiện truy vấn
                    lock: transaction.LOCK.UPDATE
                });

                if (customerCount >= plan.max_customers) {
                    await transaction.rollback();
                    return next(
                        new AppError(
                            'Bạn đã đạt giới hạn về số khách hàng',
                            400
                        )
                    );
                }

                req.transaction = transaction;
                next();
            }
            req.transaction = transaction;
            next();
        } catch (err) {
            await transaction.rollback();
            return next(new AppError(err.message, 500));
        }
    }),
    user: catchAsync(async (req, res, next) => {
        try {
            const idQuery = req.idQuery;
            const transaction = await User.sequelize.transaction();
            const plan = await getPlanCurrent(idQuery);
            if (plan.max_users != -1) {
                const userCount = await User.count({
                    where: { parent_id: idQuery },
                    transaction,
                    //khóa các record liên quan đến điều kiện truy vấn
                    lock: transaction.LOCK.UPDATE
                });

                if (userCount >= plan.max_users) {
                    await transaction.rollback();
                    return next(
                        new AppError(
                            'Bạn đã đạt giới hạn về số người dùng',
                            400
                        )
                    );
                }

                req.transaction = transaction;
                next();
            }
            req.transaction = transaction;
            next();
        } catch (err) {
            await transaction.rollback();
            return next(new AppError(err.message, 500));
        }
    }),

    vendor: catchAsync(async (req, res, next) => {
        try {
            const idQuery = req.idQuery;
            const transaction = await Vendor.sequelize.transaction();
            const plan = await getPlanCurrent(idQuery);
            if (plan.max_vendors != -1) {
                const vendorCount = await Vendor.count({
                    where: { created_by: idQuery },
                    transaction,
                    //khóa các record liên quan đến điều kiện truy vấn
                    lock: transaction.LOCK.UPDATE
                });

                if (vendorCount >= plan.max_vendors) {
                    await transaction.rollback();
                    return next(
                        new AppError(
                            'Bạn đã đạt giới hạn về số nhà cung cấp',
                            400
                        )
                    );
                }

                req.transaction = transaction;
                next();
            }
            req.transaction = transaction;
            next();
        } catch (err) {
            await transaction.rollback();
            return next(new AppError(err.message, 500));
        }
    })
};

module.exports = checkPlanLimits;
