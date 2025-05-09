const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const branchService = require('../../../services/user/branch/branchService');

const branchController = {
    getInitBranch: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const branchesInit = await branchService.getInitBranch(idQuery);
        return ApiResponse.success(
            res,
            branchesInit,
            'Lấy danh sách khởi tạo chi nhánh thành công',
            200
        );
    }),
    getListBranches: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const branches = await branchService.getAllBranches(idQuery);
        return ApiResponse.success(
            res,
            branches,
            'Lấy danh sách chi nhánh thành công',
            200
        );
    }),

    getBranchById: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const branch = await branchService.getBranchById(
            req.params.id,
            idQuery
        );
        return ApiResponse.success(
            res,
            branch,
            'Lấy thông tin chi nhánh thành công',
            200
        );
    }),

    createBranch: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const newBranch = await branchService.createBranch(req.body, idQuery);
        return ApiResponse.success(
            res,
            newBranch,
            'Chi nhánh đã được tạo thành công',
            201
        );
    }),

    updateBranch: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const updatedBranch = await branchService.updateBranch(
            req.params.id,
            idQuery,
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
        const idQuery = req.idQuery;
        await branchService.deleteBranch(req.params.id, idQuery);
        return ApiResponse.success(
            res,
            null,
            'Chi nhánh đã được xóa thành công',
            204
        );
    })
};

module.exports = branchController;
