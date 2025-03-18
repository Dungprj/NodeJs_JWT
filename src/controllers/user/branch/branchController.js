const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const branchService = require('../../../services/user/branch/branchService');

const branchController = {
    getListBranches: catchAsync(async (req, res) => {
        const userCurrent = req.user;
        const branches = await branchService.getAllBranches(userCurrent);
        return ApiResponse.success(
            res,
            branches,
            'Lấy danh sách chi nhánh thành công',
            200
        );
    }),

    getBranchById: catchAsync(async (req, res) => {
        const branch = await branchService.getBranchById(req.params.id);
        return ApiResponse.success(
            res,
            branch,
            'Lấy thông tin chi nhánh thành công',
            200
        );
    }),

    createBranch: catchAsync(async (req, res) => {
        const userCurrent = req.user;
        const newBranch = await branchService.createBranch(
            req.body,
            userCurrent
        );
        return ApiResponse.success(
            res,
            newBranch,
            'Chi nhánh đã được tạo thành công',
            201
        );
    }),

    updateBranch: catchAsync(async (req, res) => {
        const updatedBranch = await branchService.updateBranch(
            req.params.id,
            req.body
        );
        return ApiResponse.success(
            res,
            updatedBranch,
            'Cập nhật chi nhánh thành công',
            200
        );
    }),

    deleteBranch: catchAsync(async (req, res) => {
        await branchService.deleteBranch(req.params.id);
        return ApiResponse.success(
            res,
            null,
            'Chi nhánh đã được xóa thành công',
            204
        );
    })
};

module.exports = branchController;
