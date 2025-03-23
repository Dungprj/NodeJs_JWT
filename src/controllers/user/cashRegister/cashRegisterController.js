const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const cashRegisterService = require('../../../services/user/cashRegister/cashRegisterService');

const cashRegisterController = {
    getListCashRegisters: catchAsync(async (req, res) => {
        const userCurrent = req.user;
        const cashRegisters = await cashRegisterService.getAllCashRegisters(
            userCurrent
        );
        return ApiResponse.success(
            res,
            cashRegisters,
            'Lấy danh sách quầy thu ngân thành công',
            200
        );
    }),

    getCashRegisterInit: catchAsync(async (req, res) => {
        const userCurrent = req.user;
        const cashRegistersInit = await cashRegisterService.getCashRegisterInit(
            userCurrent
        );
        return ApiResponse.success(
            res,
            cashRegistersInit,
            'Lấy danh sách quầy thu ngân thành công',
            200
        );
    }),

    getCashRegisterById: catchAsync(async (req, res) => {
        const cashRegister = await cashRegisterService.getCashRegisterById(
            req.params.id
        );
        return ApiResponse.success(
            res,
            cashRegister,
            'Lấy thông tin quầy thu ngân thành công',
            200
        );
    }),

    createCashRegister: catchAsync(async (req, res) => {
        const userCurrent = req.user;
        const newCashRegister = await cashRegisterService.createCashRegister(
            req.body,
            userCurrent
        );
        return ApiResponse.success(
            res,
            newCashRegister,
            'Quầy thu ngân đã được tạo thành công',
            201
        );
    }),

    updateCashRegister: catchAsync(async (req, res) => {
        const updatedCashRegister =
            await cashRegisterService.updateCashRegister(
                req.params.id,
                req.body
            );
        return ApiResponse.success(
            res,
            updatedCashRegister,
            'Cập nhật quầy thu ngân thành công',
            200
        );
    }),

    deleteCashRegister: catchAsync(async (req, res) => {
        await cashRegisterService.deleteCashRegister(req.params.id);
        return ApiResponse.success(
            res,
            null,
            'Quầy thu ngân đã được xóa thành công',
            204
        );
    })
};

module.exports = cashRegisterController;
