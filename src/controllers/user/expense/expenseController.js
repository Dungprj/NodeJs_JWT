const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const expenseService = require('../../../services/user/expense/expenseService');

const expensiveController = {
    getListExpense: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const expenses = await expenseService.getAllExpenses(idQuery);
        return ApiResponse.success(
            res,
            expenses,
            'Lấy danh sách chi tiêu thành công',
            200
        );
    }),

    getExpenseById: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const expense = await expenseService.getExpenseById(
            req.params.id,
            idQuery
        );
        return ApiResponse.success(
            res,
            expense,
            'Lấy thông tin chi tiêu thành công',
            200
        );
    }),

    createExpense: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const newExpense = await expenseService.createExpense(
            req.body,
            idQuery
        );
        return ApiResponse.success(
            res,
            newExpense,
            'Bản ghi chi tiêu đã được tạo thành công',
            201
        );
    }),

    updateExpense: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const updatedExpense = await expenseService.updateExpense(
            req.params.id,
            idQuery,
            req.body
        );
        return ApiResponse.success(
            res,
            updatedExpense,
            'Cập nhật bản ghi chi tiêu thành công',
            200
        );
    }),

    deleteExpense: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        await expenseService.deleteExpense(req.params.id, idQuery);
        return ApiResponse.success(
            res,
            null,
            'Bản ghi chi tiêu đã được xóa thành công',
            204
        );
    })
};

module.exports = expensiveController;
