const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const permissionService = require('../../../services/user/permission/permissionService');

const permissionController = {
    // Lấy danh sách quyền (200 OK)
    getListPermission: catchAsync(async (req, res) => {
        const userCurrent = req.user;
        const permissions = await permissionService.getListPermission(
            userCurrent
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
