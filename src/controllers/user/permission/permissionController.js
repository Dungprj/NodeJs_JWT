const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const permissionService = require('../../../services/user/permission/permissionService');

const permissionController = {
    // Lấy danh sách quyền (200 OK)
    getListPermissionInit: catchAsync(async (req, res) => {
        const typeQuery = req.typeQuery;

        const permissions = await permissionService.getListPermissionInit(
            typeQuery
        );

        return ApiResponse.success(
            res,
            permissions,
            'Lấy danh sách quyền thành công',
            200
        );
    }),
    getMyPermission: catchAsync(async (req, res) => {
        const myType = req.type;
        const permissions = await permissionService.getMyPermission(myType);

        return ApiResponse.success(
            res,
            permissions,
            'Lấy danh sách quyền thành công',
            200
        );
    })
};

module.exports = permissionController;
