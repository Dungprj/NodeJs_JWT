const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const vendorService = require('../../../services/user/vendor/vendorService');

const vendorController = {
    // Lấy danh sách nhà cung cấp (200 OK)
    getListVendor: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;

        const vendors = await vendorService.getAllVendors(idQuery);

        return ApiResponse.success(
            res,
            vendors,
            'Lấy danh sách nhà cung cấp thành công',
            200
        );
    }),

    // Lấy chi tiết nhà cung cấp theo ID (200 OK | 404 Not Found)
    getVendorById: catchAsync(async (req, res) => {
        const vendor = await vendorService.getVendorById(req.params.id);
        return ApiResponse.success(
            res,
            vendor,
            'Lấy thông tin nhà cung cấp thành công',
            200
        );
    }),

    // Tạo mới nhà cung cấp (201 Created | 400 Bad Request)
    createVendor: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const transaction = req.transaction;
        const newVendor = await vendorService.createVendor(req.body, idQuery);

        return ApiResponse.success(
            res,
            newVendor,
            'Nhà cung cấp đã được tạo thành công',
            201
        );
    }),

    // Cập nhật nhà cung cấp (200 OK | 404 Not Found)
    updateVendor: catchAsync(async (req, res) => {
        const updatedVendor = await vendorService.updateVendor(
            req.params.id,
            req.body
        );
        return ApiResponse.success(
            res,
            updatedVendor,
            'Cập nhật nhà cung cấp thành công',
            200
        );
    }),

    // Xóa nhà cung cấp (204 No Content | 404 Not Found)
    deleteVendor: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        await vendorService.deleteVendor(req.params.id, idQuery);
        return ApiResponse.success(
            res,
            null,
            'Nhà cung cấp đã được xóa thành công',
            204
        );
    })
};

module.exports = vendorController;
