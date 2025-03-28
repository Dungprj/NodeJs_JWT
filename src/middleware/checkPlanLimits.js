require('dotenv').config();
const catchAsync = require('../utils/catchAsync');
const planService = require('../services/admin/plan/planService');
const AppError = require('../utils/appError');
const redisClient = require('../config/redis'); // Import từ file cấu hình

const User = require('../db/models/user');
const Plan = require('../db/models/plan');
const Vendor = require('../db/models/vendor');
const Customer = require('../db/models/customer');
const commom = require('../common/common');

// Hàm lấy plan hiện tại của user
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

// Middleware kiểm tra giới hạn
const checkPlanLimits = {
    customer: catchAsync(async (req, res, next) => {
        try {
            const idQuery = req.idQuery;

            const plan = await getPlanCurrent(idQuery);

            if (plan.max_customers != -1) {
                const redisKey = `customer_count:${idQuery}`;

                // Lấy số lượng hiện tại từ Redis
                const currentCount = parseInt(
                    (await redisClient.get(redisKey)) || 0
                );

                // Nếu đã đạt giới hạn trước khi tăng
                if (currentCount >= plan.max_customers) {
                    return next(
                        new AppError(
                            'Bạn đã đạt giới hạn về số khách hàng',
                            409
                        )
                    );
                }

                // Tăng đếm trong Redis (atomic operation)
                const newCount = await redisClient.incr(redisKey);

                console.log(
                    'Số lượng khách hàng mới là ----------------',
                    newCount
                );
                if (newCount > plan.max_customers) {
                    // Nếu vượt giới hạn do race condition, giảm lại và từ chối
                    await redisClient.decr(redisKey);

                    return next(
                        new AppError(
                            'Bạn đã đạt giới hạn về số khách hàng',
                            409
                        )
                    );
                }

                // Đặt TTL cho key (ví dụ: 30 ngày)
                await redisClient.expire(
                    redisKey,
                    commom.parseDurationToMilliseconds(
                        process.env.JWT_REFRESH_EXPIRE
                    )
                );

                next();
            } else {
                next();
            }
        } catch (err) {
            // Nếu lỗi, giảm đếm trong Redis để giữ đồng bộ
            const redisKey = `customer_count:${req.idQuery}`;
            const currentCount = await redisClient.get(redisKey);
            if (currentCount > 0) {
                await redisClient.decr(redisKey);
            }

            return next(new AppError(err.message, 500));
        }
    }),

    user: catchAsync(async (req, res, next) => {
        try {
            const idQuery = req.idQuery;

            const plan = await getPlanCurrent(idQuery);

            if (plan.max_users != -1) {
                const redisKey = `sub_user_count:${idQuery}`;

                // Lấy số lượng hiện tại từ Redis
                const currentCount = parseInt(
                    (await redisClient.get(redisKey)) || 0
                );

                // Nếu đã đạt giới hạn trước khi tăng
                if (currentCount >= plan.max_users) {
                    return next(
                        new AppError(
                            'Bạn đã đạt giới hạn về số người dùng',
                            409
                        )
                    );
                }

                // Tăng đếm trong Redis (atomic operation)
                const newCount = await redisClient.incr(redisKey);

                console.log('Số lượng user mới là ----------------', newCount);
                if (newCount > plan.max_users) {
                    // Nếu vượt giới hạn do race condition, giảm lại và từ chối
                    await redisClient.decr(redisKey);

                    return next(
                        new AppError(
                            'Bạn đã đạt giới hạn về số người dùng',
                            409
                        )
                    );
                }

                // Đặt TTL cho key (ví dụ: 30 ngày)
                await redisClient.expire(
                    redisKey,
                    commom.parseDurationToMilliseconds(
                        process.env.JWT_REFRESH_EXPIRE
                    )
                );

                next();
            } else {
                next();
            }
        } catch (err) {
            // Nếu lỗi, giảm đếm trong Redis để giữ đồng bộ
            const redisKey = `sub_user_count:${req.idQuery}`;
            const currentCount = await redisClient.get(redisKey);
            if (currentCount > 0) {
                await redisClient.decr(redisKey);
            }

            return next(new AppError(err.message, 500));
        }
    }),

    vendor: catchAsync(async (req, res, next) => {
        try {
            const idQuery = req.idQuery;

            const plan = await getPlanCurrent(idQuery);

            if (plan.max_vendors != -1) {
                const redisKey = `vendor_count:${idQuery}`;

                // Lấy số lượng hiện tại từ Redis
                const currentCount = parseInt(
                    (await redisClient.get(redisKey)) || 0
                );

                console.log('du lieu lay dc tu redis la ', currentCount);

                // Nếu đã đạt giới hạn trước khi tăng
                if (currentCount >= plan.max_vendors) {
                    return next(
                        new AppError(
                            'Bạn đã đạt giới hạn về số nhà cung cấp ' +
                                currentCount,
                            409
                        )
                    );
                }

                // Tăng đếm trong Redis (atomic operation)
                const newCount = await redisClient.incr(redisKey);

                console.log(
                    'Số lượng nhà cung cấp mới là ----------------',
                    newCount
                );
                if (newCount > plan.max_vendors) {
                    // Nếu vượt giới hạn do race condition, giảm lại và từ chối
                    const soLuongSauKhiGiam = await redisClient.decr(redisKey);

                    console.log(
                        'Số lượng nhà cung cấp sau khi bị lỗi  111',
                        soLuongSauKhiGiam
                    );

                    return next(
                        new AppError(
                            'Bạn đã đạt giới hạn về số nhà cung cấp 222',

                            409
                        )
                    );
                }

                // Đặt TTL cho key (ví dụ: 30 ngày)
                await redisClient.expire(
                    redisKey,
                    commom.parseDurationToMilliseconds(
                        process.env.JWT_REFRESH_EXPIRE
                    )
                );

                next();
            } else {
                next();
            }
        } catch (err) {
            // Nếu lỗi, giảm đếm trong Redis để giữ đồng bộ
            const redisKey = `vendor_count:${req.idQuery}`;
            const currentCount = await redisClient.get(redisKey);
            if (currentCount > 0) {
                await redisClient.decr(redisKey);
            }

            return next(new AppError(err.message, 500));
        }
    }),

    //đồng bộ số lượng user con từ MySQL vào Redis
    syncVendorCount: async parentId => {
        const redisKey = `vendor_count:${parentId}`;
        const count = await Vendor.count({ where: { created_by: parentId } });
        await redisClient.set(redisKey, count);

        const userGEt = await redisClient.get(redisKey);

        console.log(
            'Số lượng nhà cung cấp sau khi dong bo là ----------------',
            userGEt
        );
        await redisClient.expire(
            redisKey,
            commom.parseDurationToMilliseconds(process.env.JWT_REFRESH_EXPIRE)
        ); // TTL 1 ngày
    },
    syncCustomerCount: async parentId => {
        const redisKey = `customer_count:${parentId}`;
        const count = await Customer.count({ where: { created_by: parentId } });
        await redisClient.set(redisKey, count);

        const userGEt = await redisClient.get(redisKey);

        console.log(
            'Số lượng customer sau khi dong bo là ----------------',
            userGEt
        );
        await redisClient.expire(
            redisKey,
            commom.parseDurationToMilliseconds(process.env.JWT_REFRESH_EXPIRE)
        ); // TTL 1 ngày
    },
    syncSubUserCount: async parentId => {
        const redisKey = `sub_user_count:${parentId}`;
        const count = await User.count({ where: { parent_id: parentId } });
        await redisClient.set(redisKey, count);

        const userGEt = await redisClient.get(redisKey);

        console.log(
            'Số lượng user con sau khi dong bo là ----------------',
            userGEt
        );
        await redisClient.expire(
            redisKey,
            commom.parseDurationToMilliseconds(process.env.JWT_REFRESH_EXPIRE)
        ); // TTL 1 ngày
    }
};

module.exports = checkPlanLimits;
