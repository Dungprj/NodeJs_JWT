const express = require('express');
const expenseController = require('../../../controllers/user/expense/expenseController');
const expenseRoutes = express.Router();
const checkPermission = require('../../../middleware/permission');
const PERMISSION = require('../../../utils/permission');

expenseRoutes.get(
    '/',
    checkPermission(PERMISSION.MANAGE_EXPENSE),
    expenseController.getListExpense
);
expenseRoutes.get(
    '/:id',
    checkPermission(PERMISSION.MANAGE_EXPENSE),
    expenseController.getExpenseById
);
expenseRoutes.post(
    '/',
    checkPermission(PERMISSION.CREATE_EXPENSE),
    expenseController.createExpense
);
expenseRoutes.put(
    '/:id',
    checkPermission(PERMISSION.EDIT_EXPENSE),
    expenseController.updateExpense
);
expenseRoutes.delete(
    '/:id',
    checkPermission(PERMISSION.DELETE_EXPENSE),
    expenseController.deleteExpense
);

module.exports = expenseRoutes;
