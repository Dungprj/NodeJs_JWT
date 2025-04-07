const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const permissionService = require('../../../services/user/permission/permissionService');

const common = require('../../../common/common');
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
        //Truy vấn database để lấy danh sách quyền dựa trên idRole
        const permissions = await common.getListPermission(req.type);

        soLuongQuyenHandled = 0;
        let listPermissionHandled = [];

        if (permissions && permissions.length > 0) {
            const soLuongQuyen = permissions.length;
            soLuongQuyenHandled = soLuongQuyen;
            const dataConvert = permissions.map(pers => ({
                [pers.name]: true
            }));

            // Gộp mảng thành một object
            const mergedObject = dataConvert.reduce(
                (result, item) => Object.assign(result, item),
                {}
            );

            listPermissionHandled = mergedObject;
        }

        return ApiResponse.success(
            res,
            listPermissionHandled,
            'Lấy danh sách quyền thành công',
            200
        );
    })
};

module.exports = permissionController;
