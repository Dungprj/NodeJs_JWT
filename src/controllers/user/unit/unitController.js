const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const unitService = require('../../../services/user/unit/unitService');

const unitController = {
    // Lấy danh sách đơn vị (200 OK)
    getListUnit: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;

        const units = await unitService.getAllUnits(idQuery);

        return ApiResponse.success(
            res,
            units,
            'Lấy danh sách đơn vị thành công',
            200
        );
    }),

    // Lấy chi tiết đơn vị theo ID (200 OK | 404 Not Found)
    getUnitById: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const unit = await unitService.getUnitById(req.params.id, idQuery);
        return ApiResponse.success(
            res,
            unit,
            'Lấy thông tin đơn vị thành công',
            200
        );
    }),

    // Tạo mới đơn vị (201 Created | 400 Bad Request)
    createUnit: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;

        const newUnit = await unitService.createUnit(req.body, idQuery);

        return ApiResponse.success(
            res,
            newUnit,
            'Đơn vị đã được tạo thành công',
            201
        );
    }),

    // Cập nhật đơn vị (200 OK | 404 Not Found)
    updateUnit: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const updatedUnit = await unitService.updateUnit(
            req.params.id,
            idQuery,
            req.body
        );
        return ApiResponse.success(
            res,
            updatedUnit,
            'Cập nhật đơn vị thành công',
            200
        );
    }),

    // Xóa đơn vị (204 No Content | 404 Not Found)
    deleteUnit: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        await unitService.deleteUnit(req.params.id, idQuery);
        return ApiResponse.success(
            res,
            null,
            'Đơn vị đã được xóa thành công',
            204
        );
    })
};

module.exports = unitController;
