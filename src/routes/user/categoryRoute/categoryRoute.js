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
    checkPermission(PERMISSION.MANAGE_CATEGORY),
    categoryController.getCategoryById
);
categoryRoute.post(
    '/',
    checkPermission(PERMISSION.CREATE_CATEGORY),
    categoryController.createCategory
);
categoryRoute.put(
    '/:id',
    checkPermission(PERMISSION.EDIT_CATEGORY),
    categoryController.updateCategory
);
categoryRoute.delete(
    '/:id',
    checkPermission(PERMISSION.DELETE_CATEGORY),
    categoryController.deleteCategory
);

module.exports = categoryRoute;
