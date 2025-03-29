const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const cashRegisterService = require('../../../services/user/cashRegister/cashRegisterService');

const cashRegisterController = {
    getListCashRegisters: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const cashRegisters = await cashRegisterService.getAllCashRegisters(
            idQuery
        );
        return ApiResponse.success(
            res,
            cashRegisters,
            'Lấy danh sách quầy thu ngân thành công',
            200
        );
    }),

    getCashRegisterInit: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const cashRegistersInit = await cashRegisterService.getCashRegisterInit(
            idQuery
        );
        return ApiResponse.success(
            res,
            cashRegistersInit,
            'Lấy danh sách quầy thu ngân thành công',
            200
        );
    }),

    getCashRegisterById: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const cashRegister = await cashRegisterService.getCashRegisterById(
            req.params.id,
            idQuery
        );
        return ApiResponse.success(
            res,
            cashRegister,
            'Lấy thông tin quầy thu ngân thành công',
            200
        );
    }),

    createCashRegister: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const newCashRegister = await cashRegisterService.createCashRegister(
            req.body,
            idQuery
        );
        return ApiResponse.success(
            res,
            newCashRegister,
            'Quầy thu ngân đã được tạo thành công',
            200
        );
    }),

    updateCashRegister: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const updatedCashRegister =
            await cashRegisterService.updateCashRegister(
                req.params.id,
                idQuery,
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
        const idQuery = req.idQuery;
        await cashRegisterService.deleteCashRegister(req.params.id, idQuery);
        return ApiResponse.success(
            res,
            null,
            'Quầy thu ngân đã được xóa thành công',
            204
        );
    })
};

module.exports = cashRegisterController;
