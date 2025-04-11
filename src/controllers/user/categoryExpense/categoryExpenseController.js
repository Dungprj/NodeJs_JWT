const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const expenseCategoryService = require('../../../services/user/categoryExpense/expenseCategoryService');

const ExpenseCategoryController = {
    getListExpenseCategory: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const ExpenseCategories =
            await expenseCategoryService.getAllExpenseCategories(idQuery);
        return ApiResponse.success(
            res,
            ExpenseCategories,
            'Lấy danh sách danh mục chi tiêu thành công',
            200
        );
    }),

    getExpenseCategoryById: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const ExpenseCategory =
            await expenseCategoryService.getExpenseCategoryById(
                req.params.id,
                idQuery
            );
        return ApiResponse.success(
            res,
            ExpenseCategory,
            'Lấy thông tin danh mục chi tiêu thành công',
            200
        );
    }),

    createExpenseCategory: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const newExpenseCategory =
            await expenseCategoryService.createExpenseCategory(
                req.body,
                idQuery
            );
        return ApiResponse.success(
            res,
            newExpenseCategory,
            'Danh mục chi tiêu đã được tạo thành công',
            201
        );
    }),

    updateExpenseCategory: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const updatedExpenseCategory =
            await expenseCategoryService.updateExpenseCategory(
                req.params.id,
                idQuery,
                req.body
            );
        return ApiResponse.success(
            res,
            updatedExpenseCategory,
            'Cập nhật danh mục chi tiêu thành công',
            200
        );
    }),

    deleteExpenseCategory: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        await expenseCategoryService.deleteExpenseCategory(
            req.params.id,
            idQuery
        );
        return ApiResponse.success(
            res,
            null,
            'Danh mục chi tiêu đã được xóa thành công',
            204
        );
    })
};

module.exports = ExpenseCategoryController;
