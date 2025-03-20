const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const roleService = require('../../../services/user/role/roleService');

const roleController = {
    getListRole: catchAsync(async (req, res) => {
        const userCurrent = req.user;
        const listRolePermission = await roleService.getListRole(userCurrent);
        return ApiResponse.success(
            res,
            listRolePermission,
            'Lấy danh sách vai trò thành công',
            200
        );
    }),

    createRole: catchAsync(async (req, res) => {
        const userCurrent = req.user;

        const role = await roleService.createRole(req.body, userCurrent);

        return ApiResponse.success(
            res,
            role,
            'Vai trò đã được tạo thành công',
            201
        );
    }),
    updateRole: catchAsync(async (req, res) => {
        const userCurrent = req.user;

        const updatedRole = await roleService.updatePermissionsForRole(
            userCurrent,
            req.params.id,
            req.body
        );
        return ApiResponse.success(
            res,
            updatedRole,
            'Vai trò đã được cập nhật thành công',
            200
        );
    }),
    deleteRole: catchAsync(async (req, res) => {
        const userCurrent = req.user;

        await roleService.deleteRole(req.params.id, userCurrent);
        return ApiResponse.success(
            res,
            null,
            'Vai trò đã được xóa thành công',
            204
        );
    })
};

module.exports = roleController;
