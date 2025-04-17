require('dotenv').config();
const Brand = require('../../../db/models/brand');
const AppError = require('../../../utils/appError');
const { Op } = require('sequelize');
const commom = require('../../../common/common');
const brandService = {
    // Lấy tất cả thương hiệu của user (200 OK | 404 Not Found)
    getAllBrands: async idQuẻy => {
        const brands = await Brand.findAll({
            where: { created_by: idQuẻy }
        });

        if (!brands) {
            throw new AppError('Danh sách thương hiệu không tồn tại', 404);
        }
        return brands;
    },

    // Lấy thông tin thương hiệu theo ID (200 OK | 404 Not Found)
    getBrandById: async (id, idQuery) => {
        const brand = await Brand.findOne({
            where: { id, created_by: idQuery }
        });
        if (!brand) {
            throw new AppError('Không tìm thấy thương hiệu', 404);
        }
        return brand;
    },

    // Tạo thương hiệu mới (201 Created | 400 Bad Request)
    createBrand: async (data, idQuery) => {
        const transaction = await Brand.sequelize.transaction();
        try {
            if (!data.name) {
                throw new AppError('Tên thương hiệu là bắt buộc', 400);
            }

            const brands = await Brand.findOne({
                where: {
                    slug: commom.generateSlug(data.name),
                    created_by: idQuery
                }
            });

            if (brands) {
                throw new AppError('Tên thương hiệu đã tồn tại', 409);
            }

            const newBrand = await Brand.create(
                {
                    name: data.name,
                    created_by: idQuery
                },
                { transaction }
            );
            // Commit transaction nếu thành công
            await transaction.commit();
            return newBrand;
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

    // Cập nhật thương hiệu (200 OK | 404 Not Found)
    updateBrand: async (id, idQuery, data) => {
        const transaction = await Brand.sequelize.transaction();
        try {
            const brand = await Brand.findByPk(id);
            if (!brand) {
                throw new AppError(
                    'Không tìm thấy thương hiệu để cập nhật',
                    404
                );
            }

            const existingBrand = await Brand.findOne({
                //op.ne : not equal
                where: {
                    name: data.name,
                    id: { [Op.ne]: id },
                    created_by: idQuery
                }
            });

            if (existingBrand) {
                throw new AppError('thương hiệu đã tồn tại', 409);
            }

            if (data.name) brand.name = data.name;

            await brand.save({ transaction });
            await transaction.commit();
            return brand;
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

    // Xóa thương hiệu (204 No Content | 404 Not Found)
    deleteBrand: async (id, idQuery) => {
        const transaction = await Brand.sequelize.transaction();
        try {
            const brand = await Brand.findOne({
                where: { id, created_by: idQuery }
            });
            if (!brand) {
                throw new AppError('Không tìm thấy thương hiệu để xóa', 404);
            }

            await brand.destroy({ transaction });
            // Commit transaction nếu thành công
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

module.exports = brandService;
