const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const brandService = require('../../../services/user/brand/brandService');

const brandController = {
    getListBrand: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const brands = await brandService.getAllBrands(idQuery);
        return ApiResponse.success(
            res,
            brands,
            'Lấy danh sách thương hiệu thành công',
            200
        );
    }),

    getBrandById: catchAsync(async (req, res) => {
        const brand = await brandService.getBrandById(req.params.id);
        return ApiResponse.success(
            res,
            brand,
            'Lấy thông tin thương hiệu thành công',
            200
        );
    }),

    createBrand: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const newBrand = await brandService.createBrand(req.body, idQuery);
        return ApiResponse.success(
            res,
            newBrand,
            'Thương hiệu đã được tạo thành công',
            201
        );
    }),

    updateBrand: catchAsync(async (req, res) => {
        const updatedBrand = await brandService.updateBrand(
            req.params.id,
            req.body
        );
        return ApiResponse.success(
            res,
            updatedBrand,
            'Cập nhật thương hiệu thành công',
            200
        );
    }),

    deleteBrand: catchAsync(async (req, res) => {
        await brandService.deleteBrand(req.params.id);
        return ApiResponse.success(
            res,
            null,
            'Thương hiệu đã được xóa thành công',
            204
        );
    })
};

module.exports = brandController;
