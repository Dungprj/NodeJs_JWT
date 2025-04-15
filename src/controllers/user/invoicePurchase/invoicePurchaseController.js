const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const invoicePurchaseService = require('../../../services/user/invoicePurcharse/invoicePurcharseService'); // Đường dẫn đến invoicePurchaseService

const invoicePurchaseController = {
    // Lấy tất cả hóa đơn nhập hàng của user (GET /api/invoice-purchases)
    getListInvoicePurchase: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const invoicePurchases =
            await invoicePurchaseService.getAllInvoicePurchases(idQuery);
        return ApiResponse.success(
            res,
            invoicePurchases,
            'Lấy danh sách hóa đơn nhập hàng thành công',
            200
        );
    }),

    // Lấy hóa đơn nhập hàng theo ID (GET /api/invoice-purchases/:id)
    getQRcodeInvoicePurchaseById: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const invoicePurchase = await invoicePurchaseService.generateQRCode(
            idQuery,
            req.params.id
        );
        return ApiResponse.success(
            res,
            invoicePurchase,
            'Lấy link QR hóa đơn nhập hàng thành công',
            200
        );
    }),

    // Lấy hóa đơn nhập hàng theo ID (GET /api/invoice-purchases/:id)
    getInvoicePurchaseById: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const invoicePurchase =
            await invoicePurchaseService.getInvoicePurchaseById(
                idQuery,
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
        const idQuery = req.idQuery;
        const idUserCurrent = req.user.id;

        const newInvoicePurchase =
            await invoicePurchaseService.createInvoicePurchase(
                req.body,
                idQuery,
                idUserCurrent
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
        const idQuery = req.idQuery;
        const updatedInvoicePurchase =
            await invoicePurchaseService.updateInvoicePurchase(
                req.params.id,
                req.body,
                idQuery
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
        const idQuery = req.idQuery;
        await invoicePurchaseService.deleteInvoicePurchase(
            req.params.id,
            idQuery
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
