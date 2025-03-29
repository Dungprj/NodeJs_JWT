require('dotenv').config();
const Tax = require('../../../db/models/tax');
const AppError = require('../../../utils/appError');
const { Op } = require('sequelize');
const taxService = {
    // Lấy tất cả thuế của user (200 OK | 404 Not Found)
    getAllTaxes: async idQuery => {
        const taxes = await Tax.findAll({
            where: { created_by: idQuery }
        });

        if (!taxes) {
            throw new AppError('Danh sách thuế không tồn tại', 404);
        }

        return taxes;
    },

    // Lấy thông tin thuế theo ID (200 OK | 404 Not Found)
    getTaxById: async (id, idQuery) => {
        const tax = await Tax.findOne({
            where: { id, created_by: idQuery }
        });
        if (!tax) {
            throw new AppError('Không tìm thấy thuế', 404);
        }
        return tax;
    },

    // Tạo thuế mới (201 Created | 400 Bad Request)
    createTax: async (data, idQuery) => {
        const transaction = await Tax.sequelize.transaction();
        try {
            if (!data.name || !data.percentage) {
                throw new AppError(
                    'Tên thuế và phần trăm thuế là bắt buộc',
                    400
                );
            }

            const taxs = await Tax.findOne({
                where: {
                    name: data.name,
                    created_by: idQuery
                },
                transaction: transaction
            });

            if (taxs) {
                throw new AppError('Tên thuế đã tồn tại', 409);
            }

            const newTax = await Tax.create(
                {
                    name: data.name,
                    percentage: data.percentage,
                    is_default: data.is_default || 0,
                    created_by: idQuery
                },
                {
                    transaction
                }
            );
            await transaction.commit();
            return newTax;
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

    // Cập nhật thuế (200 OK | 404 Not Found)
    updateTax: async (id, idQuery, data) => {
        const transaction = await Tax.sequelize.transaction();
        try {
            const tax = await Tax.findOne({
                where: {
                    id: id,
                    created_by: idQuery
                },
                transaction: transaction
            });
            if (!tax) {
                throw new AppError('Không tìm thấy thuế để cập nhật', 404);
            }

            if (data.name) {
                const isExistTaxName = await Tax.findOne({
                    where: {
                        name: data.name,
                        created_by: idQuery,
                        id: { [Op.ne]: id } // Loại bỏ danh mục hiện tại khỏi kết quả
                    },
                    transaction: transaction
                });

                if (isExistTaxName) {
                    throw new AppError('Thuế đã tồn tại', 409);
                }
            }

            if (data.name) tax.name = data.name;
            if (data.percentage) tax.percentage = data.percentage;
            if (data.is_default !== undefined) tax.is_default = data.is_default;

            await tax.save({ transaction });
            await transaction.commit();
            return tax;
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
    // Xóa thuế (204 No Content | 404 Not Found)
    deleteTax: async (id, idQuery) => {
        const transaction = await Tax.sequelize.transaction();
        try {
            const tax = await Tax.findOne({
                where: { id, created_by: idQuery },
                transaction: transaction
            });
            if (!tax) {
                throw new AppError('Không tìm thấy thuế để xóa', 404);
            }

            await tax.destroy({ transaction });
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

module.exports = taxService;
