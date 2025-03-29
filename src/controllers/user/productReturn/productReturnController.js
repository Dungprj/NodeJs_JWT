const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const productReturnService = require('../../../services/user/productReturn/productReturnService'); // Đường dẫn đến productReturnService

const productReturnController = {
    // Lấy tất cả phiếu trả hàng của user (GET /api/product-returns)
    getListProductReturn: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const productReturns = await productReturnService.getAllProductReturns(
            idQuery
        );
        return ApiResponse.success(
            res,
            productReturns,
            'Lấy danh sách phiếu trả hàng thành công',
            200
        );
    }),

    // Lấy phiếu trả hàng theo ID (GET /api/product-returns/:id)
    getProductReturnById: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const productReturn = await productReturnService.getProductReturnById(
            req.params.id,
            idQuery
        );
        return ApiResponse.success(
            res,
            productReturn,
            'Lấy thông tin phiếu trả hàng thành công',
            200
        );
    }),

    // Tạo phiếu trả hàng mới (POST /api/product-returns)
    createProductReturn: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const newProductReturn = await productReturnService.createProductReturn(
            req.body,
            idQuery
        );
        return ApiResponse.success(
            res,
            newProductReturn,
            'Phiếu trả hàng đã được tạo thành công',
            201
        );
    }),

    // Cập nhật phiếu trả hàng (PUT /api/product-returns/:id)
    updateProductReturn: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const updatedProductReturn =
            await productReturnService.updateProductReturn(
                req.params.id,
                req.body,
                idQuery
            );
        return ApiResponse.success(
            res,
            updatedProductReturn,
            'Cập nhật phiếu trả hàng thành công',
            200
        );
    }),

    // Xóa phiếu trả hàng (DELETE /api/product-returns/:id)
    deleteProductReturn: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        await productReturnService.deleteProductReturn(req.params.id, idQuery);
        return ApiResponse.success(
            res,
            null,
            'Phiếu trả hàng đã được xóa thành công',
            204
        );
    })
};

module.exports = productReturnController;
