const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const planService = require('../../../services/user/plan/planService');

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

    getDateExpire: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;

        const plansDateExpire = await planService.getDateExpire(idQuery);
        return ApiResponse.success(
            res,
            plansDateExpire,
            'Lấy ngày hết hạn plan thành công',
            200
        );
    })
};

module.exports = planController;
