require('dotenv').config();

const Unit = require('../../../db/models/unit');
const AppError = require('../../../utils/appError');
const { Op } = require('sequelize');
const unitService = {
    // Lấy tất cả đơn vị của user (200 OK | 404 Not Found)
    getAllUnits: async idQuery => {
        const units = await Unit.findAll({
            where: { created_by: idQuery }
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
    createUnit: async (data, idQuery) => {
        const transaction = await Unit.sequelize.transaction();
        try {
            if (!data.name || !data.shortname) {
                throw new AppError(
                    'Tên đơn vị và tên viết tắt là bắt buộc',
                    400
                );
            }
            const units = await Unit.findOne({
                where: {
                    name: data.name,
                    created_by: idQuery
                },
                transaction: transaction
            });

            if (units) {
                throw new AppError('Tên đơn vị đã tồn tại', 409);
            }

            const newUnit = await Unit.create(
                {
                    name: data.name,
                    shortname: data.shortname,
                    created_by: idQuery
                },
                {
                    transaction
                }
            );
            await transaction.commit();
            return newUnit;
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

    // Cập nhật đơn vị (200 OK | 404 Not Found | 400 Bad Request)
    updateUnit: async (id, idQuery, data) => {
        const transaction = await Unit.sequelize.transaction();
        try {
            const unit = await Unit.findOne({
                where: {
                    id: id,
                    created_by: idQuery
                },
                transaction: transaction
            });
            if (!unit) {
                throw new AppError('Không tìm thấy đơn vị để cập nhật', 404);
            }
            if (data.name) {
                const isExistUnitName = await Unit.findOne({
                    where: {
                        name: data.name,
                        created_by: idQuery,
                        id: { [Op.ne]: id } // Loại bỏ danh mục hiện tại khỏi kết quả
                    },
                    transaction: transaction
                });

                if (isExistUnitName) {
                    throw new AppError('Đơn vị đã tồn tại', 409);
                }
            }

            if (data.name) unit.name = data.name;
            if (data.shortname) unit.shortname = data.shortname;

            await unit.save({ transaction });
            await transaction.commit();
            return unit;
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

    // Xóa đơn vị (204 No Content | 404 Not Found)
    deleteUnit: async (id, idQuery) => {
        const transaction = await Unit.sequelize.transaction();
        try {
            const unit = await Unit.findOne({
                where: {
                    id: id,
                    created_by: idQuery
                }
            });
            if (!unit) {
                throw new AppError('Không tìm thấy đơn vị để xóa', 404);
            }

            await unit.destroy({ transaction });
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

module.exports = unitService;
