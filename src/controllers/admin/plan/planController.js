const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const planService = require('../../../services/admin/plan/planService');

const planController = {
    getListPlan: catchAsync(async (req, res) => {
        const userCurrent = req.user;
        const plans = await planService.getAllPlans(userCurrent);
        return ApiResponse.success(
            res,
            plans,
            'Lấy danh sách plan thành công',
            200
        );
    }),

    getPlanById: catchAsync(async (req, res) => {
        const plan = await planService.getPlanById(req.params.id);
        return ApiResponse.success(
            res,
            plan,
            'Lấy thông tin plan thành công',
            200
        );
    }),

    createPlan: catchAsync(async (req, res) => {
        const userCurrent = req.user;
        const newPlan = await planService.createPlan(req.body, userCurrent);
        return ApiResponse.success(
            res,
            newPlan,
            'Plan đã được tạo thành công',
            201
        );
    }),

    updatePlan: catchAsync(async (req, res) => {
        const updatedPlan = await planService.updatePlan(
            req.params.id,
            req.body
        );
        return ApiResponse.success(
            res,
            updatedPlan,
            'Cập nhật plan thành công',
            200
        );
    }),

    deletePlan: catchAsync(async (req, res) => {
        await planService.deletePlan(req.params.id);
        return ApiResponse.success(
            res,
            null,
            'Plan đã được xóa thành công',
            204
        );
    })
};

module.exports = planController;
