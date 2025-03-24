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
    },

    // Tạo plan mới (201 Created | 400 Bad Request)
    createPlan: async (data, user) => {
        // Kiểm tra các trường bắt buộc
        if (!data.name) {
            throw new AppError('Tên plan là bắt buộc', 400);
        }
        if (!data.price) {
            throw new AppError('Giá plan là bắt buộc', 400);
        }
        if (!data.duration) {
            throw new AppError('Thời hạn (duration) là bắt buộc', 400);
        }
        if (!data.max_users) {
            throw new AppError('Số người dùng giới hạn là bắt buộc', 400);
        }
        if (!data.max_customers) {
            throw new AppError('Số khách hàng giới hạn là bắt buộc', 400);
        }
        if (!data.max_vendors) {
            throw new AppError('Số nhà cung cấp giới hạn là bắt buộc', 400);
        }

        const isExistPlan = await Plan.findAll({
            where: {
                name: data.name
            }
        });
        if (isExistPlan && isExistPlan.length > 0) {
            throw new AppError('Tên plan đã tồn tại', 400);
        }

        // Tạo plan mới
        const newPlan = await Plan.create({
            name: data.name,
            price: data.price || 0, // Giá mặc định là 0 nếu không có
            duration: data.duration,
            max_users: data.max_users || 0, // Mặc định là 0 nếu không có
            max_customers: data.max_customers || 0, // Mặc định là 0 nếu không có
            max_vendors: data.max_vendors || 0, // Mặc định là 0 nếu không có
            description: data.description || '' // Mô tả có thể null
        });

        return newPlan;
    },

    // Cập nhật plan (200 OK | 404 Not Found | 400 Bad Request)
    updatePlan: async (id, data) => {
        const plan = await Plan.findByPk(id);
        if (!plan) {
            throw new AppError('Không tìm thấy plan để cập nhật', 404);
        }

        // Nếu cập nhật tên, kiểm tra xem slug mới có trùng không
        if (data.name) {
            const isExistPlan = await Plan.findAll({
                where: {
                    name: data.name
                }
            });

            if (isExistPlan) {
            }
        }

        // Cập nhật các trường khác nếu có
        if (data.price !== undefined) plan.price = data.price;
        if (data.duration) plan.duration = data.duration;
        if (data.max_users !== undefined) plan.max_users = data.max_users;
        if (data.max_customers !== undefined)
            plan.max_customers = data.max_customers;
        if (data.max_vendors !== undefined) plan.max_vendors = data.max_vendors;
        if (data.description !== undefined) plan.description = data.description;

        await plan.save();
        return plan;
    }
};

module.exports = planService;
