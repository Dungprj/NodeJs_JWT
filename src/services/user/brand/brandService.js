require('dotenv').config();
const Brand = require('../../../db/models/brand');
const AppError = require('../../../utils/appError');

const commom = require('../../../common/common');
const brandService = {
    // Lấy tất cả thương hiệu của user (200 OK | 404 Not Found)
    getAllBrands: async id => {
        const brands = await Brand.findAll({
            where: { created_by: id }
        });

        if (!brands) {
            throw new AppError('Danh sách thương hiệu không tồn tại', 404);
        }
        return brands;
    },

    // Lấy thông tin thương hiệu theo ID (200 OK | 404 Not Found)
    getBrandById: async id => {
        const brand = await Brand.findByPk(id);
        if (!brand) {
            throw new AppError('Không tìm thấy thương hiệu', 404);
        }
        return brand;
    },

    // Tạo thương hiệu mới (201 Created | 400 Bad Request)
    createBrand: async (data, id) => {
        if (!data.name) {
            throw new AppError('Tên thương hiệu là bắt buộc', 400);
        }

        const brands = await Brand.findAll({
            where: {
                slug: commom.generateSlug(data.name),
                created_by: id
            }
        });

        if (brands && brands.length > 0) {
            throw new AppError('Tên thương hiệu đã tồn tại', 409);
        }

        const newBrand = await Brand.create({
            name: data.name,
            created_by: id
        });

        return newBrand;
    },

    // Cập nhật thương hiệu (200 OK | 404 Not Found)
    updateBrand: async (id, data) => {
        const brand = await Brand.findByPk(id);
        if (!brand) {
            throw new AppError('Không tìm thấy thương hiệu để cập nhật', 404);
        }

        if (data.name) brand.name = data.name;

        await brand.save();
        return brand;
    },

    // Xóa thương hiệu (204 No Content | 404 Not Found)
    deleteBrand: async id => {
        const brand = await Brand.findByPk(id);
        if (!brand) {
            throw new AppError('Không tìm thấy thương hiệu để xóa', 404);
        }

        await brand.destroy();
        return true;
    }
};

module.exports = brandService;
