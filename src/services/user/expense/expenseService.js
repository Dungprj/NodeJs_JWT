require('dotenv').config();
const Expense = require('../../../db/models/expense');
const AppError = require('../../../utils/appError');
const { Op } = require('sequelize');
const commom = require('../../../common/common');

const ExpenseService = {
    // Lấy tất cả bản ghi chi tiêu của user (200 OK | 404 Not Found)
    getAllExpenses: async idQuery => {
        const expenses = await Expense.findAll({
            where: { created_by: idQuery }
        });

        if (!expenses) {
            throw new AppError('Danh sách chi tiêu không tồn tại', 404);
        }

        return expenses;
    },

    // Lấy thông tin chi tiêu theo ID (200 OK | 404 Not Found)
    getExpenseById: async (id, idQuery) => {
        const expense = await Expense.findOne({
            where: { id, created_by: idQuery }
        });
        if (!expense) {
            throw new AppError('Không tìm thấy bản ghi chi tiêu', 404);
        }
        return expense;
    },

    // Tạo bản ghi chi tiêu mới (201 Created | 400 Bad Request)
    createExpense: async (data, idQuery) => {
        const transaction = await Expense.sequelize.transaction();
        try {
            // Kiểm tra các trường bắt buộc
            if (
                !data.date ||
                !data.branchId ||
                !data.category_id ||
                !data.amount
            ) {
                throw new AppError(
                    'Ngày, chi nhánh, danh mục và số tiền là bắt buộc',
                    400
                );
            }

            const newExpense = await Expense.create(
                {
                    date: data.date,
                    branchId: data.branchId,
                    category_id: data.category_id,
                    amount: data.amount,
                    note: data.note || null, // Ghi chú là tùy chọn
                    created_by: idQuery
                },
                { transaction }
            );
            await transaction.commit();
            return newExpense;
        } catch (error) {
            // Rollback transaction nếu có lỗi
            await transaction.rollback();

            // Đảm bảo lỗi gốc được ném lại với mã trạng thái đúng
            if (error instanceof AppError) {
                throw error; // Giữ nguyên lỗi với mã trạng thái ban đầu (400, v.v.)
            }
            // Nếu là lỗi không mong muốn, ném lỗi 500
            throw new AppError(error, 500);
        }
    },

    // Cập nhật bản ghi chi tiêu (200 OK | 404 Not Found)
    updateExpense: async (id, idQuery, data) => {
        const transaction = await Expense.sequelize.transaction();
        try {
            const expense = await Expense.findOne({
                where: { id, created_by: idQuery }
            });
            if (!expense) {
                throw new AppError(
                    'Không tìm thấy bản ghi chi tiêu để cập nhật',
                    404
                );
            }

            // Cập nhật các trường nếu có trong data
            if (data.date) expense.date = data.date;
            if (data.branchId) expense.branchId = data.branchId;
            if (data.category_id) expense.category_id = data.category_id;
            if (data.amount) expense.amount = data.amount;
            if (data.note !== undefined) expense.note = data.note; // Ghi chú có thể là null

            await expense.save({ transaction });
            await transaction.commit();
            return expense;
        } catch (error) {
            // Rollback transaction nếu có lỗi
            await transaction.rollback();

            // Đảm bảo lỗi gốc được ném lại với mã trạng thái đúng
            if (error instanceof AppError) {
                throw error; // Giữ nguyên lỗi với mã trạng thái ban đầu (400, 404, v.v.)
            }
            // Nếu là lỗi không mong muốn, ném lỗi 500
            throw new AppError(error, 500);
        }
    },

    // Xóa bản ghi chi tiêu (204 No Content | 404 Not Found)
    deleteExpense: async (id, idQuery) => {
        const transaction = await Expense.sequelize.transaction();
        try {
            const expense = await Expense.findOne({
                where: { id, created_by: idQuery }
            });
            if (!expense) {
                throw new AppError(
                    'Không tìm thấy bản ghi chi tiêu để xóa',
                    404
                );
            }

            await expense.destroy({ transaction });
            await transaction.commit();
            return true;
        } catch (error) {
            // Rollback transaction nếu có lỗi
            await transaction.rollback();

            // Đảm bảo lỗi gốc được ném lại với mã trạng thái đúng
            if (error instanceof AppError) {
                throw error; // Giữ nguyên lỗi với mã trạng thái ban đầu (404, v.v.)
            }
            // Nếu là lỗi không mong muốn, ném lỗi 500
            throw new AppError(error, 500);
        }
    }
};

module.exports = ExpenseService;
