const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const invoiceSaleService = require('../../../services/user/invoiceSale/invoiceSaleService'); // Đường dẫn đến invoiceSaleService

const invoiceSaleController = {
    // Lấy tất cả hóa đơn bán hàng của user (GET /api/invoice-sales)
    getListInvoiceSale: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const invoiceSales = await invoiceSaleService.getAllInvoiceSales(
            idQuery
        );
        return ApiResponse.success(
            res,
            invoiceSales,
            'Lấy danh sách hóa đơn bán hàng thành công',
            200
        );
    }),

    // Lấy hóa đơn bán hàng theo ID (GET /api/invoice-sales/:id)
    getInvoiceSaleById: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const invoiceSale = await invoiceSaleService.getInvoiceSaleById(
            idQuery,
            req.params.id
        );
        return ApiResponse.success(
            res,
            invoiceSale,
            'Lấy thông tin hóa đơn bán hàng thành công',
            200
        );
    }),

    // Tạo hóa đơn bán hàng mới (POST /api/invoice-sales)
    createInvoiceSale: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const newInvoiceSale = await invoiceSaleService.createInvoiceSale(
            req.body,
            idQuery
        );
        return ApiResponse.success(
            res,
            newInvoiceSale,
            'Hóa đơn bán hàng đã được tạo thành công',
            201
        );
    }),

    // Cập nhật hóa đơn bán hàng (PUT /api/invoice-sales/:id)
    updateInvoiceSale: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const updatedInvoiceSale = await invoiceSaleService.updateInvoiceSale(
            req.params.id,
            req.body,
            idQuery
        );
        return ApiResponse.success(
            res,
            updatedInvoiceSale,
            'Cập nhật hóa đơn bán hàng thành công',
            200
        );
    }),

    // Xóa hóa đơn bán hàng (DELETE /api/invoice-sales/:id)
    deleteInvoiceSale: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        await invoiceSaleService.deleteInvoiceSale(req.params.id, idQuery);
        return ApiResponse.success(
            res,
            null,
            'Hóa đơn bán hàng đã được xóa thành công',
            204
        );
    })
};

module.exports = invoiceSaleController;
