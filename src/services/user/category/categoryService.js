require('dotenv').config();
const Category = require('../../../db/models/category');
const AppError = require('../../../utils/appError');
const { Op } = require('sequelize');
const commom = require('../../../common/common');

const categoryService = {
    // Lấy tất cả danh mục của user (200 OK | 404 Not Found)
    getAllCategories: async idQuery => {
        const categories = await Category.findAll({
            where: { created_by: idQuery }
        });

        if (!categories) {
            throw new AppError('Danh sách danh mục không tồn tại', 404);
        }

        return categories;
    },

    // Lấy thông tin danh mục theo ID (200 OK | 404 Not Found)
    getCategoryById: async (id, idQuery) => {
        const category = await Category.findOne({
            where: { id, created_by: idQuery }
        });
        if (!category) {
            throw new AppError('Không tìm thấy danh mục', 404);
        }
        return category;
    },

    // Tạo danh mục mới (201 Created | 400 Bad Request)
    createCategory: async (data, idQuery) => {
        const transaction = await Category.sequelize.transaction();
        try {
            if (!data.name) {
                throw new AppError('Tên danh mục là bắt buộc', 400);
            }

            const categories = await Category.findOne({
                where: {
                    slug: commom.generateSlug(data.name),
                    created_by: idQuery
                }
            });

            if (categories) {
                throw new AppError('Tên danh mục đã tồn tại', 409);
            }

            const newCategory = await Category.create(
                {
                    name: data.name,
                    created_by: idQuery
                },
                { transaction }
            );
            await transaction.commit();
            return newCategory;
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

    // Cập nhật danh mục (200 OK | 404 Not Found)
    updateCategory: async (id, idQuery, data) => {
        const transaction = await Category.sequelize.transaction();
        try {
            const category = await Category.findOne({
                where: { id, created_by: idQuery }
            });
            if (!category) {
                throw new AppError('Không tìm thấy danh mục để cập nhật', 404);
            }
            const isExistCategoryName = await Category.findOne({
                where: {
                    slug: commom.generateSlug(data.name),
                    created_by: idQuery,
                    id: { [Op.ne]: id } // Loại bỏ danh mục hiện tại khỏi kết quả
                }
            });

            if (isExistCategoryName) {
                throw new AppError('danh mục đã tồn tại', 409);
            }

            if (data.name) category.name = data.name;

            await category.save({ transaction });
            await transaction.commit();
            return category;
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

    // Xóa danh mục (204 No Content | 404 Not Found)
    deleteCategory: async (id, idQuery) => {
        const transaction = await Category.sequelize.transaction();
        try {
            const category = await Category.findOne({
                where: { id, created_by: idQuery }
            });
            if (!category) {
                throw new AppError('Không tìm thấy danh mục để xóa', 404);
            }

            await category.destroy({ transaction });
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

module.exports = categoryService;
