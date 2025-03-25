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

        if (!products.length) {
            return next(
                new AppError('Không có sản phẩm nào trong hệ thống', 404)
            );
        }

        return ApiResponse.success(
            res,
            products,
            'Lấy danh sách sản phẩm thành công',
            200
        );
    }),

    // Lấy chi tiết sản phẩm theo ID (200 OK | 404 Not Found)
    getProductById: catchAsync(async (req, res, next) => {
        const product = await productService.getProductById(req.params.id);

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
            const newProduct = await productService.createProductPost(
                newProductData,
                idQuery
            );

            return ApiResponse.success(
                res,
                newProduct,
                'Sản phẩm đã được tạo thành công',
                201
            );
        });
    }),

    // Cập nhật sản phẩm (200 OK | 404 Not Found)
    updateProduct: catchAsync(async (req, res, next) => {
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
            const updatedProduct = await productService.updateProduct(
                req.params.id,
                updatedProductData
            );

            if (!updatedProduct) {
                return next(new AppError('Không thể cập nhật sản phẩm', 400));
            }

            return ApiResponse.success(
                res,
                updatedProduct,
                'Cập nhật sản phẩm thành công',
                200
            );
        });
    }),

    // Xóa sản phẩm (204 No Content | 404 Not Found)
    deleteProduct: catchAsync(async (req, res, next) => {
        const deleted = await productService.deleteProduct(req.params.id);

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
