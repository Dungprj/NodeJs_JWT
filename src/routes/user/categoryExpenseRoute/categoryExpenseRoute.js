const express = require('express');
const categoryExpenseController = require('../../../controllers/user/categoryExpense/categoryExpenseController');
const checkPermission = require('../../../middleware/permission');
const categoryExpenseRoute = express.Router();

//Enum permission
const PERMISSION = require('../../../utils/permission');

categoryExpenseRoute.get(
    '/',
    checkPermission(PERMISSION.MANAGE_EXPENSE_CATEGORY),
    categoryExpenseController.getListExpenseCategory
);
categoryExpenseRoute.get(
    '/:id',
    checkPermission(PERMISSION.MANAGE_EXPENSE_CATEGORY),
    categoryExpenseController.getExpenseCategoryById
);
categoryExpenseRoute.post(
    '/',
    checkPermission(PERMISSION.CREATE_EXPENSE_CATEGORY),
    categoryExpenseController.createExpenseCategory
);
categoryExpenseRoute.put(
    '/:id',
    checkPermission(PERMISSION.EDIT_EXPENSE_CATEGORY),
    categoryExpenseController.updateExpenseCategory
);
categoryExpenseRoute.delete(
    '/:id',
    checkPermission(PERMISSION.DELETE_EXPENSE_CATEGORY),
    categoryExpenseController.deleteExpenseCategory
);

module.exports = categoryExpenseRoute;
