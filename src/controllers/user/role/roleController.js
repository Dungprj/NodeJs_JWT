const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const roleService = require('../../../services/user/role/roleService');

const roleController = {
    getListRoleInit: catchAsync(async (req, res) => {
        const listRolePermission = await roleService.getListRole();
        return ApiResponse.success(
            res,
            listRolePermission,
            'Lấy danh sách vai trò thành công',
            200
        );
    }),

    createRole: catchAsync(async (req, res) => {
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

module.exports = roleController;
