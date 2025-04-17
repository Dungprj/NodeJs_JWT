require('dotenv').config();
const ExpenseCategory = require('../../../db/models/expensecategory');
const AppError = require('../../../utils/appError');
const { Op } = require('sequelize');
const commom = require('../../../common/common');

const ExpenseCategoryService = {
    // Lấy tất cả danh mục chi tiêu của user (200 OK | 404 Not Found)
    getAllExpenseCategories: async idQuery => {
        const ExpenseCategories = await ExpenseCategory.findAll({
            where: { created_by: idQuery }
        });

        if (!ExpenseCategories) {
            throw new AppError(
                'Danh sách danh mục chi tiêu không tồn tại',
                404
            );
        }

        return ExpenseCategories;
    },

    // Lấy thông tin danh mục chi tiêu theo ID (200 OK | 404 Not Found)
    getExpenseCategoryById: async (id, idQuery) => {
        const ExpenseCategory = await ExpenseCategory.findOne({
            where: { id, created_by: idQuery }
        });
        if (!ExpenseCategory) {
            throw new AppError('Không tìm thấy danh mục chi tiêu', 404);
        }
        return ExpenseCategory;
    },

    // Tạo danh mục chi tiêu mới (201 Created | 400 Bad Request)
    createExpenseCategory: async (data, idQuery) => {
        const transaction = await ExpenseCategory.sequelize.transaction();
        try {
            if (!data.name) {
                throw new AppError('Tên danh mục chi tiêu là bắt buộc', 400);
            }

            // const ExpenseCategories = await ExpenseCategory.findOne({
            //     where: {
            //         slug: commom.generateSlug(data.name),
            //         created_by: idQuery
            //     }
            // });

            // if (ExpenseCategories) {
            //     throw new AppError('Tên danh mục chi tiêu đã tồn tại', 409);
            // }

            const newExpenseCategory = await ExpenseCategory.create(
                {
                    name: data.name,
                    created_by: idQuery
                },
                { transaction }
            );
            await transaction.commit();
            return newExpenseCategory;
        } catch (error) {
            // Rollback transaction nếu có lỗi
            await transaction.rollback();

            // Đảm bảo lỗi gốc được ném lại với mã trạng thái đúng
            if (error instanceof AppError) {
                throw error; // Giữ nguyên lỗi với mã trạng thái ban đầu (400, 409, v.v.)
            }
            // Nếu là lỗi không mong muốn, ném lỗi 500
            throw new AppError(error, 500);
        }
    },

    // Cập nhật danh mục chi tiêu (200 OK | 404 Not Found)
    updateExpenseCategory: async (id, idQuery, data) => {
        const transaction = await ExpenseCategory.sequelize.transaction();
        try {
            const ExpenseCategoryItem = await ExpenseCategory.findOne({
                where: { id, created_by: idQuery }
            });
            if (!ExpenseCategory) {
                throw new AppError(
                    'Không tìm thấy danh mục chi tiêu để cập nhật',
                    404
                );
            }

            // const isExistExpenseCategoryName =
            //     await ExpenseCategory.findOne({
            //         where: {
            //             slug: commom.generateSlug(data.name),
            //             created_by: idQuery,
            //             id: { [Op.ne]: id } // Loại bỏ danh mục hiện tại khỏi kết quả
            //         }
            //     });

            // if (isExistExpenseCategoryName) {
            //     throw new AppError('Danh mục chi tiêu đã tồn tại', 409);
            // }

            if (data.name) ExpenseCategoryItem.name = data.name;

            await ExpenseCategoryItem.save({ transaction });
            await transaction.commit();
            return ExpenseCategory;
        } catch (error) {
            // Rollback transaction nếu có lỗi
            await transaction.rollback();

            // Đảm bảo lỗi gốc được ném lại với mã trạng thái đúng
            if (error instanceof AppError) {
                throw error; // Giữ nguyên lỗi với mã trạng thái ban đầu (400, 409, v.v.)
            }
            // Nếu là lỗi không mong muốn, ném lỗi 500
            throw new AppError(error, 500);
        }
    },

    // Xóa danh mục chi tiêu (204 No Content | 404 Not Found)
    deleteExpenseCategory: async (id, idQuery) => {
        const transaction = await ExpenseCategory.sequelize.transaction();
        try {
            const ExpenseCategoryItem = await ExpenseCategory.findOne({
                where: { id, created_by: idQuery }
            });
            if (!ExpenseCategory) {
                throw new AppError(
                    'Không tìm thấy danh mục chi tiêu để xóa',
                    404
                );
            }

            await ExpenseCategoryItem.destroy({ transaction });
            await transaction.commit();
            return true;
        } catch (error) {
            // Rollback transaction nếu có lỗi
            await transaction.rollback();

            // Đảm bảo lỗi gốc được ném lại với mã trạng thái đúng
            if (error instanceof AppError) {
                throw error; // Giữ nguyên lỗi với mã trạng thái ban đầu (400, 409, v.v.)
            }
            // Nếu là lỗi không mong muốn, ném lỗi 500
            throw new AppError(error, 500);
        }
    }
};

module.exports = ExpenseCategoryService;
