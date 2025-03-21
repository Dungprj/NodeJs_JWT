const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const categoryService = require('../../../services/user/category/categoryService');

const categoryController = {
    getListCategory: catchAsync(async (req, res) => {
        const userCurrent = req.user;
        const categories = await categoryService.getAllCategories(userCurrent);
        return ApiResponse.success(
            res,
            categories,
            'Lấy danh sách danh mục thành công',
            200
        );
    }),

    getCategoryById: catchAsync(async (req, res) => {
        const category = await categoryService.getCategoryById(req.params.id);
        return ApiResponse.success(
            res,
            category,
            'Lấy thông tin danh mục thành công',
            200
        );
    }),

    createCategory: catchAsync(async (req, res) => {
        const userCurrent = req.user;
        const newCategory = await categoryService.createCategory(
            req.body,
            userCurrent
        );
        return ApiResponse.success(
            res,
            newCategory,
            'Danh mục đã được tạo thành công',
            201
        );
    }),

    updateCategory: catchAsync(async (req, res) => {
        const updatedCategory = await categoryService.updateCategory(
            req.params.id,
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
        await categoryService.deleteCategory(req.params.id);
        return ApiResponse.success(
            res,
            null,
            'Danh mục đã được xóa thành công',
            204
        );
    })
};

module.exports = categoryController;
