const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const productService = require('../../../services/user/product/productService');
const AppError = require('../../../utils/appError');
const upload = require('../../../utils/upload'); // Import Multer config
const defaultImage = 'default-product.jpg'; // Tên ảnh mặc định

const productController = {
    // Lấy danh sách sản phẩm (200 OK)

    getAllProducts: catchAsync(async (req, res, next) => {
        const idQuery = req.idQuery;
        const products = await productService.getAllProducts(idQuery);

        return ApiResponse.success(
            res,
            products,
            'Lấy danh sách sản phẩm thành công',
            200
        );
    }),

    // Lấy chi tiết sản phẩm theo ID (200 OK | 404 Not Found)
    getProductById: catchAsync(async (req, res, next) => {
        const idQuery = req.idQuery;
        const product = await productService.getProductById(
            req.params.id,
            idQuery
        );

        if (!product) {
            return next(new AppError('Sản phẩm không tồn tại', 404));
        }

        return ApiResponse.success(
            res,
            product,
            'Lấy thông tin sản phẩm thành công',
            200
        );
    }),
    ProductGetInit: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const products = await productService.ProductGetInit(idQuery);
        return ApiResponse.success(
            res,
            products,
            'Lấy danh sách thông tin khởi tạo sản phẩm thành công  ',
            200
        );
    }),
    // Tạo mới sản phẩm (201 Created | 400 Bad Request)
    createProductPost: catchAsync(async (req, res, next) => {
        const idQuery = req.idQuery;
        // Xử lý tải ảnh sản phẩm lên
        //tên key là image
        upload.single('image')(req, res, async err => {
            if (err) {
                return next(new AppError(err.message, 400)); // Xử lý lỗi upload
            }

            // Thêm tên file ảnh vào data
            const newProductData = {
                ...req.body,
                image: req.file ? req.file.filename : null
            };

            // Gọi service để tạo sản phẩm mới
            const result = await productService.createProductPost(
                newProductData,
                idQuery
            );

            if (result.status == 'fail' || result.status == 'error') {
                return ApiResponse.error(res, result);
            }

            return ApiResponse.success(
                res,
                result,
                'Sản phẩm đã được tạo thành công',
                201
            );
        });
    }),

    // Cập nhật sản phẩm (200 OK | 404 Not Found)
    updateProduct: catchAsync(async (req, res, next) => {
        const idQuery = req.idQuery;
        // Xử lý tải ảnh sản phẩm lên
        upload.single('image')(req, res, async err => {
            if (err) {
                return next(new AppError(err.message, 400)); // Xử lý lỗi upload
            }

            // Log dữ liệu nhận được từ client
            console.log('req.body:', req.body);
            console.log('req.file:', req.file);

            // Thêm tên file ảnh (nếu có) vào dữ liệu cập nhật
            const updatedProductData = {
                ...req.body,
                image: req.file ? req.file.filename : null
            };

            // Gọi service để cập nhật sản phẩm
            const result = await productService.updateProduct(
                req.params.id,
                idQuery,
                updatedProductData
            );

            if (result.status == 'fail' || result.status == 'error') {
                return ApiResponse.error(res, result);
            }

            return ApiResponse.success(
                res,
                result,
                'Cập nhật sản phẩm thành công',
                200
            );
        });
    }),

    // Xóa sản phẩm (204 No Content | 404 Not Found)
    deleteProduct: catchAsync(async (req, res, next) => {
        const idQuery = req.idQuery;
        const deleted = await productService.deleteProduct(
            req.params.id,
            idQuery
        );

        if (!deleted) {
            return next(new AppError('Sản phẩm không tồn tại', 404));
        }

        return ApiResponse.success(
            res,
            null,
            'Sản phẩm đã được xóa thành công',
            204
        );
    })
};

module.exports = productController;
