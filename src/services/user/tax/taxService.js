require('dotenv').config();
const Tax = require('../../../db/models/tax');
const AppError = require('../../../utils/appError');

const taxService = {
    // Lấy tất cả thuế của user (200 OK | 404 Not Found)
    getAllTaxes: async user => {
        const taxes = await Tax.findAll({
            where: { created_by: user.id }
        });

        if (!taxes) {
            throw new AppError('Danh sách thuế không tồn tại', 404);
        }

        return taxes;
    },

    // Lấy thông tin thuế theo ID (200 OK | 404 Not Found)
    getTaxById: async id => {
        const tax = await Tax.findByPk(id);
        if (!tax) {
            throw new AppError('Không tìm thấy thuế', 404);
        }
        return tax;
    },

    // Tạo thuế mới (201 Created | 400 Bad Request)
    createTax: async (data, user) => {
        if (!data.name || !data.percentage) {
            throw new AppError('Tên thuế và phần trăm thuế là bắt buộc', 400);
        }

        const newTax = await Tax.create({
            name: data.name,
            percentage: data.percentage,
            is_default: data.is_default || 0,
            created_by: user.id
        });
        return newTax;
    },

    // Cập nhật thuế (200 OK | 404 Not Found)
    updateTax: async (id, data) => {
        const tax = await Tax.findByPk(id);
        if (!tax) {
            throw new AppError('Không tìm thấy thuế để cập nhật', 404);
        }

        if (data.name) tax.name = data.name;
        if (data.percentage) tax.percentage = data.percentage;
        if (data.is_default !== undefined) tax.is_default = data.is_default;

        await tax.save();
        return tax;
    },
    // Xóa thuế (204 No Content | 404 Not Found)
    deleteTax: async id => {
        const tax = await Tax.findByPk(id);
        if (!tax) {
            throw new AppError('Không tìm thấy thuế để xóa', 404);
        }

        await tax.destroy();
        return true;
    }
};

module.exports = taxService;
