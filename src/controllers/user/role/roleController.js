const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const roleService = require('../../../services/user/role/roleService');

const roleController = {
    getListRole: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const listRolePermission = await roleService.getListRole(idQuery);
        return ApiResponse.success(
            res,
            listRolePermission,
            'Lấy danh sách vai trò thành công',
            200
        );
    }),

    createRole: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;

        const role = await roleService.createRole(req.body, idQuery);

        return ApiResponse.success(
            res,
            role,
            'Vai trò đã được tạo thành công',
            201
        );
    }),
    updateRole: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;

        const updatedRole = await roleService.updatePermissionsForRole(
            idQuery,
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
        const idQuery = req.idQuery;

        await roleService.deleteRole(req.params.id, idQuery);
        return ApiResponse.success(
            res,
            null,
            'Vai trò đã được xóa thành công',
            204
        );
    })
};

module.exports = roleController;
