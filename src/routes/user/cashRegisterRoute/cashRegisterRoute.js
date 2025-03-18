const express = require('express');
const cashRegisterController = require('../../../controllers/user/cashRegister/cashRegisterController');

const cashRegisterRoutes = express.Router();

cashRegisterRoutes.get('/', cashRegisterController.getListCashRegisters);
cashRegisterRoutes.post('/', cashRegisterController.createCashRegister);
cashRegisterRoutes.put('/:id', cashRegisterController.updateCashRegister);
cashRegisterRoutes.delete('/:id', cashRegisterController.deleteCashRegister);

module.exports = cashRegisterRoutes;
