require('dotenv').config();
const CashRegister = require('../../../db/models/cashregister');
const Branch = require('../../../db/models/branch');

const AppError = require('../../../utils/appError');

const cashRegisterService = {
    getCashRegisterInit: async user => {
        const branchList = await Branch.findAll({
            where: {
                created_by: user.id
            }
        });

        if (!branchList) {
            throw new AppError('Danh sách chi nhánh không tồn tại', 404);
        }
        return branchList;
    },
    // Lấy tất cả quầy thu ngân của user (200 OK | 404 Not Found)
    getAllCashRegisters: async user => {
        const cashRegisters = await CashRegister.findAll({
            where: { created_by: user.id }
        });

        if (!cashRegisters) {
            throw new AppError('Danh sách quầy thu ngân không tồn tại', 404);
        }

        return cashRegisters;
    },

    // Lấy thông tin quầy thu ngân theo ID (200 OK | 404 Not Found)
    getCashRegisterById: async id => {
        const cashRegister = await CashRegister.findByPk(id);
        if (!cashRegister) {
            throw new AppError('Không tìm thấy quầy thu ngân', 404);
        }
        return cashRegister;
    },

    // Tạo quầy thu ngân mới (201 Created | 400 Bad Request)
    createCashRegister: async (data, user) => {
        if (!data.name) {
            throw new AppError('Tên quầy thu ngân là bắt buộc', 400);
        }
        if (!data.branch_id) {
            throw new AppError('Chi nhánh là bắt buộc', 400);
        }

        const newCashRegister = await CashRegister.create({
            name: data.name,
            branch_id: data.branch_id,
            created_by: user.id
        });

        return newCashRegister;
    },

    // Cập nhật quầy thu ngân (200 OK | 404 Not Found)
    updateCashRegister: async (id, data) => {
        const cashRegister = await CashRegister.findByPk(id);
        if (!cashRegister) {
            throw new AppError('Không tìm thấy quầy thu ngân để cập nhật', 404);
        }

        if (data.name) cashRegister.name = data.name;
        if (data.branch_id !== undefined)
            cashRegister.branch_id = data.branch_id;

        await cashRegister.save();
        return cashRegister;
    },

    // Xóa quầy thu ngân (204 No Content | 404 Not Found)
    deleteCashRegister: async id => {
        const cashRegister = await CashRegister.findByPk(id);
        if (!cashRegister) {
            throw new AppError('Không tìm thấy quầy thu ngân để xóa', 404);
        }

        await cashRegister.destroy();
        return true;
    }
};

module.exports = cashRegisterService;
