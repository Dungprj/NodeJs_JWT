const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const invoicePurchaseService = require('../../../services/user/invoicePurcharse/invoicePurcharseService'); // Đường dẫn đến invoicePurchaseService

const invoicePurchaseController = {
    // Lấy tất cả hóa đơn nhập hàng của user (GET /api/invoice-purchases)
    getListInvoicePurchase: catchAsync(async (req, res) => {
        const userCurrent = req.user;
        const invoicePurchases =
            await invoicePurchaseService.getAllInvoicePurchases(userCurrent);
        return ApiResponse.success(
            res,
            invoicePurchases,
            'Lấy danh sách hóa đơn nhập hàng thành công',
            200
        );
    }),

    // Lấy hóa đơn nhập hàng theo ID (GET /api/invoice-purchases/:id)
    getInvoicePurchaseById: catchAsync(async (req, res) => {
        const userCurrent = req.user;
        const invoicePurchase =
            await invoicePurchaseService.getInvoicePurchaseById(
                userCurrent,
                req.params.id
            );
        return ApiResponse.success(
            res,
            invoicePurchase,
            'Lấy thông tin hóa đơn nhập hàng thành công',
            200
        );
    }),

    // Tạo hóa đơn nhập hàng mới (POST /api/invoice-purchases)
    createInvoicePurchase: catchAsync(async (req, res) => {
        const userCurrent = req.user;
        const newInvoicePurchase =
            await invoicePurchaseService.createInvoicePurchase(
                req.body,
                userCurrent
            );
        return ApiResponse.success(
            res,
            newInvoicePurchase,
            'Hóa đơn nhập hàng đã được tạo thành công',
            201
        );
    }),

    // Cập nhật hóa đơn nhập hàng (PUT /api/invoice-purchases/:id)
    updateInvoicePurchase: catchAsync(async (req, res) => {
        const userCurrent = req.user;
        const updatedInvoicePurchase =
            await invoicePurchaseService.updateInvoicePurchase(
                req.params.id,
                req.body,
                userCurrent
            );
        return ApiResponse.success(
            res,
            updatedInvoicePurchase,
            'Cập nhật hóa đơn nhập hàng thành công',
            200
        );
    }),

    // Xóa hóa đơn nhập hàng (DELETE /api/invoice-purchases/:id)
    deleteInvoicePurchase: catchAsync(async (req, res) => {
        const userCurrent = req.user;
        await invoicePurchaseService.deleteInvoicePurchase(
            req.params.id,
            userCurrent
        );
        return ApiResponse.success(
            res,
            null,
            'Hóa đơn nhập hàng đã được xóa thành công',
            204
        );
    })
};

module.exports = invoicePurchaseController;
