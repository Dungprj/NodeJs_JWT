require('dotenv').config();
const Category = require('../../../db/models/category');
const AppError = require('../../../utils/appError');

const commom = require('../../../common/common');

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
        if (!data.name) {
            throw new AppError('Tên danh mục là bắt buộc', 400);
        }

        const categories = await Category.findAll({
            where: {
                slug: commom.generateSlug(data.name),
                created_by: user.id
            }
        });

        if (categories && categories.length > 0) {
            throw new AppError('Tên danh mục đã tồn tại', 400);
        }

        const newCategory = await Category.create({
            name: data.name,
            slug: commom.generateSlug(data.name),
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
        const isExistCategory = await Category.findAll({
            where: {
                slug: commom.generateSlug(data.name)
            }
        });

        if (isExistCategory) {
            throw new AppError('danh mục đã tồn tại', 400);
        }

        if (data.name) category.name = data.name;

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
