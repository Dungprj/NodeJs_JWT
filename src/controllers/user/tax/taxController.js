const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const taxService = require('../../../services/user/tax/taxService');

const taxController = {
    // Lấy danh sách thuế (200 OK)
    getListTax: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;

        const taxes = await taxService.getAllTaxes(idQuery);
        return ApiResponse.success(
            res,
            taxes,
            'Lấy danh sách thuế thành công',
            200
        );
    }),

    // Lấy thông tin thuế theo ID (200 OK | 404 Not Found)
    getTaxById: catchAsync(async (req, res) => {
        const tax = await taxService.getTaxById(req.params.id);
        return ApiResponse.success(
            res,
            tax,
            'Lấy thông tin thuế thành công',
            200
        );
    }),

    // Tạo thuế mới (201 Created | 400 Bad Request)
    createTax: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;

        const newTax = await taxService.createTax(req.body, idQuery);
        return ApiResponse.success(
            res,
            newTax,
            'Thuế đã được tạo thành công',
            201
        );
    }),

    // Cập nhật thuế (200 OK | 404 Not Found)
    updateTax: catchAsync(async (req, res) => {
        const updatedTax = await taxService.updateTax(req.params.id, req.body);
        return ApiResponse.success(
            res,
            updatedTax,
            'Cập nhật thuế thành công',
            200
        );
    }),

    // Xóa thuế (204 No Content | 404 Not Found)
    deleteTax: catchAsync(async (req, res) => {
        await taxService.deleteTax(req.params.id);
        return ApiResponse.success(
            res,
            null,
            'Thuế đã được xóa thành công',
            204
        );
    })
};

module.exports = taxController;
