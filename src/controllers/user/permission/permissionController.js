const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const permissionService = require('../../../services/user/permission/permissionService');

const permissionController = {
    // Lấy danh sách quyền (200 OK)
    getListPermissionInit: catchAsync(async (req, res) => {
        const typeUserCurrent = req.user.type;
        const permissions = await permissionService.getListPermissionInit(
            typeUserCurrent
        );

        return ApiResponse.success(
            res,
            permissions,
            'Lấy danh sách quyền thành công',
            200
        );
    })
};

module.exports = permissionController;
