const express = require('express');
const productReturnController = require('../../../controllers/user/productReturn/productReturnController');

const productReturnRoute = express.Router();
const checkPermission = require('../../../middleware/permission');
//Enum permission
const PERMISSION = require('../../../utils/permission');

productReturnRoute.get(
    '/',
    checkPermission(PERMISSION.MANAGE_RETURNS),
    productReturnController.getListProductReturn
);
productReturnRoute.get(
    '/:id',
    checkPermission(PERMISSION.MANAGE_RETURNS),
    productReturnController.getProductReturnById
);
productReturnRoute.post(
    '/',
    checkPermission(PERMISSION.CREATE_RETURNS),
    productReturnController.createProductReturn
);
productReturnRoute.put(
    '/:id',
    checkPermission(PERMISSION.EDIT_RETURNS),
    productReturnController.updateProductReturn
);
productReturnRoute.delete(
    '/:id',
    checkPermission(PERMISSION.DELETE_RETURNS),
    productReturnController.deleteProductReturn
);

module.exports = productReturnRoute;
