const express = require('express');
const cashRegisterController = require('../../../controllers/user/cashRegister/cashRegisterController');
const cashRegisterRoutes = express.Router();
const checkPermission = require('../../../middleware/permission');
const PERMISSION = require('../../../utils/permission');
// checkPermission(PERMISSION)

cashRegisterRoutes.get(
    '/',
    checkPermission(PERMISSION.MANAGE_CASH_REGISTER),
    cashRegisterController.getListCashRegisters
);
cashRegisterRoutes.post(
    '/',
    checkPermission(PERMISSION.CREATE_CASH_REGISTER),
    cashRegisterController.createCashRegister
);
cashRegisterRoutes.put(
    '/:id',
    checkPermission(PERMISSION.EDIT_CASH_REGISTER),
    cashRegisterController.updateCashRegister
);
cashRegisterRoutes.delete(
    '/:id',
    checkPermission(PERMISSION.DELETE_CASH_REGISTER),
    cashRegisterController.deleteCashRegister
);

module.exports = cashRegisterRoutes;
