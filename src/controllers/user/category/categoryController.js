const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const categoryService = require('../../../services/user/category/categoryService');

const categoryController = {
    getListCategory: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const categories = await categoryService.getAllCategories(idQuery);
        return ApiResponse.success(
            res,
            categories,
            'Lấy danh sách danh mục thành công',
            200
        );
    }),

    getCategoryById: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const category = await categoryService.getCategoryById(
            req.params.id,
            idQuery
        );
        return ApiResponse.success(
            res,
            category,
            'Lấy thông tin danh mục thành công',
            200
        );
    }),

    createCategory: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const newCategory = await categoryService.createCategory(
            req.body,
            idQuery
        );
        return ApiResponse.success(
            res,
            newCategory,
            'Danh mục đã được tạo thành công',
            201
        );
    }),

    updateCategory: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const updatedCategory = await categoryService.updateCategory(
            req.params.id,
            idQuery,
            req.body
        );
        return ApiResponse.success(
            res,
            updatedCategory,
            'Cập nhật danh mục thành công',
            200
        );
    }),

    deleteCategory: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        await categoryService.deleteCategory(req.params.id, idQuery);
        return ApiResponse.success(
            res,
            null,
            'Danh mục đã được xóa thành công',
            204
        );
    })
};

module.exports = categoryController;
