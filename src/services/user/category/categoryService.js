require('dotenv').config();
const Category = require('../../../db/models/category');
const AppError = require('../../../utils/appError');

const categoryService = {
    // Lấy tất cả danh mục của user (200 OK | 404 Not Found)
    getAllCategories: async user => {
        const categories = await Category.findAll({
            where: { created_by: user.id }
        });

        if (!categories) {
            throw new AppError('Danh sách danh mục không tồn tại', 404);
        }

        return categories;
    },

    // Lấy thông tin danh mục theo ID (200 OK | 404 Not Found)
    getCategoryById: async id => {
        const category = await Category.findByPk(id);
        if (!category) {
            throw new AppError('Không tìm thấy danh mục', 404);
        }
        return category;
    },

    // Tạo danh mục mới (201 Created | 400 Bad Request)
    createCategory: async (data, user) => {
        if (!data.name || !data.slug) {
            throw new AppError('Tên danh mục và slug là bắt buộc', 400);
        }

        const newCategory = await Category.create({
            name: data.name,
            slug: data.slug,
            created_by: user.id
        });

        return newCategory;
    },

    // Cập nhật danh mục (200 OK | 404 Not Found)
    updateCategory: async (id, data) => {
        const category = await Category.findByPk(id);
        if (!category) {
            throw new AppError('Không tìm thấy danh mục để cập nhật', 404);
        }

        if (data.name) category.name = data.name;
        if (data.slug) category.slug = data.slug;

        await category.save();
        return category;
    },

    // Xóa danh mục (204 No Content | 404 Not Found)
    deleteCategory: async id => {
        const category = await Category.findByPk(id);
        if (!category) {
            throw new AppError('Không tìm thấy danh mục để xóa', 404);
        }

        await category.destroy();
        return true;
    }
};

module.exports = categoryService;
