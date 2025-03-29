require('dotenv').config();
const CashRegister = require('../../../db/models/cashregister');
const Branch = require('../../../db/models/branch');
const { Op } = require('sequelize');
const AppError = require('../../../utils/appError');

const cashRegisterService = {
    getCashRegisterInit: async idQuery => {
        const branchList = await Branch.findAll({
            where: {
                created_by: idQuery
            }
        });

        if (!branchList) {
            throw new AppError('Danh sách chi nhánh không tồn tại', 404);
        }
        return branchList;
    },
    // Lấy tất cả quầy thu ngân của user (200 OK | 404 Not Found)
    getAllCashRegisters: async idQuery => {
        const cashRegisters = await CashRegister.findAll({
            include: {
                attributes: ['id', 'name'],
                model: Branch,
                as: 'branch'
            },
            where: { created_by: idQuery }
        });

        if (!cashRegisters || cashRegisters.length === 0) {
            throw new AppError('Danh sách quầy thu ngân không tồn tại', 404);
        }

        return cashRegisters;
    },

    // Lấy thông tin quầy thu ngân theo ID (200 OK | 404 Not Found)
    getCashRegisterById: async (id, idQuery) => {
        const cashRegister = await CashRegister.findOne({
            where: { id, created_by: idQuery },
            include: {
                model: Branch,
                attributes: ['id', 'name']
            }
        });
        if (!cashRegister) {
            throw new AppError('Không tìm thấy quầy thu ngân', 404);
        }
        return cashRegister;
    },

    // Tạo quầy thu ngân mới (201 Created | 400 Bad Request)
    createCashRegister: async (data, idQuery) => {
        const transaction = await CashRegister.sequelize.transaction();
        try {
            // Kiểm tra dữ liệu đầu vào
            if (!data.name) {
                throw new AppError('Tên quầy thu ngân là bắt buộc', 400);
            }
            if (!data.branch_id) {
                throw new AppError('Chi nhánh là bắt buộc', 400);
            }

            // Kiểm tra trùng lặp tên
            const existingCashRegister = await CashRegister.findOne({
                where: { name: data.name, created_by: idQuery }
            });

            if (existingCashRegister) {
                throw new AppError('Quầy thu ngân đã tồn tại', 409);
            }

            // Tạo bản ghi mới
            const newCashRegister = await CashRegister.create(
                {
                    name: data.name,
                    branch_id: data.branch_id,
                    created_by: idQuery // Sửa 'id' thành 'idQuery' nếu đây là ý định của bạn
                },
                { transaction }
            );

            // Commit transaction nếu thành công
            await transaction.commit();
            return newCashRegister;
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

    // Cập nhật quầy thu ngân (200 OK | 404 Not Found)
    updateCashRegister: async (id, idQuery, data) => {
        const transaction = await CashRegister.sequelize.transaction();
        try {
            const cashRegister = await CashRegister.findOne({
                where: { id, created_by: idQuery }
            });
            if (!cashRegister) {
                throw new AppError(
                    'Không tìm thấy quầy thu ngân để cập nhật',
                    404
                );
            }

            const existingcashRegister = await CashRegister.findOne({
                where: {
                    name: data.name,
                    id: { [Op.ne]: id },
                    created_by: idQuery
                }
            });

            if (existingcashRegister) {
                throw new AppError('thương hiệu đã tồn tại', 409);
            }

            if (data.name) cashRegister.name = data.name;
            if (data.branch_id !== undefined)
                cashRegister.branch_id = data.branch_id;

            await cashRegister.save({ transaction });
            // Commit transaction nếu thành công
            await transaction.commit();
            return cashRegister;
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

    // Xóa quầy thu ngân (204 No Content | 404 Not Found)
    deleteCashRegister: async (id, idQuery) => {
        const transaction = await CashRegister.sequelize.transaction();
        try {
            const cashRegister = await CashRegister.findOne({
                where: { id, created_by: idQuery }
            });
            if (!cashRegister) {
                throw new AppError('Không tìm thấy quầy thu ngân để xóa', 404);
            }

            await cashRegister.destroy({ transaction });
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

module.exports = cashRegisterService;
