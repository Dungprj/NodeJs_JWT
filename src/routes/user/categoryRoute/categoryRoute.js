const express = require('express');
const categoryController = require('../../../controllers/user/category/categoryController');
const checkPermission = require('../../../middleware/permission');
const categoryRoute = express.Router();

//Enum permission
const PERMISSION = require('../../../utils/permission');

categoryRoute.get(
    '/',
    checkPermission(PERMISSION.MANAGE_CATEGORY),
    categoryController.getListCategory
);
categoryRoute.get(
    '/:id',
    checkPermission(PERMISSION.EDIT_CATEGORY),
    categoryController.getCategoryById
);
categoryRoute.post(
    '/',
    checkPermission(PERMISSION.CREATE_CATEGORY),
    categoryController.createCategory
);
categoryRoute.put('/:id', categoryController.updateCategory);
categoryRoute.delete('/:id', categoryController.deleteCategory);

module.exports = categoryRoute;
