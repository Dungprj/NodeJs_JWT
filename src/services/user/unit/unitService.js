require('dotenv').config();

const Unit = require('../../../db/models/unit');
const AppError = require('../../../utils/appError');

const unitService = {
    // Lấy tất cả đơn vị của user (200 OK | 404 Not Found)
    getAllUnits: async user => {
        const units = await Unit.findAll({
            where: { created_by: user.id }
        });

        if (!units) {
            throw new AppError('List Unit not found', 404);
        }

        return units;
    },

    // Lấy đơn vị theo ID (200 OK | 404 Not Found)
    getUnitById: async id => {
        const unit = await Unit.findByPk(id);
        if (!unit) {
            throw new AppError('Không tìm thấy đơn vị', 404);
        }
        return unit;
    },

    // Tạo đơn vị mới (201 Created | 400 Bad Request)
    createUnit: async (data, user) => {
        if (!data.name || !data.shortname) {
            throw new AppError('Tên đơn vị và tên viết tắt là bắt buộc', 400);
        }

        const newUnit = await Unit.create({
            name: data.name,
            shortname: data.shortname,
            created_by: user.id
        });

        return newUnit;
    },

    // Cập nhật đơn vị (200 OK | 404 Not Found | 400 Bad Request)
    updateUnit: async (id, data) => {
        const unit = await Unit.findByPk(id);
        if (!unit) {
            throw new AppError('Không tìm thấy đơn vị để cập nhật', 404);
        }

        if (data.name) unit.name = data.name;
        if (data.shortname) unit.shortname = data.shortname;

        await unit.save();
        return unit;
    },

    // Xóa đơn vị (204 No Content | 404 Not Found)
    deleteUnit: async id => {
        const unit = await Unit.findByPk(id);
        if (!unit) {
            throw new AppError('Không tìm thấy đơn vị để xóa', 404);
        }

        await unit.destroy();
        return true;
    }
};

module.exports = unitService;
