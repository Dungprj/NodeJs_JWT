const express = require('express');
const productController = require('../../../controllers/user/products/productController');

const productRoute = express.Router();

const checkPermission = require('../../../middleware/permission');
//Enum permission
const PERMISSION = require('../../../utils/permission');

productRoute.get(
    '/init',
    checkPermission(PERMISSION.MANAGE_PRODUCT),
    productController.ProductGetInit
);
productRoute.get(
    '/',
    checkPermission(PERMISSION.MANAGE_PRODUCT),
    productController.getAllProducts
);
productRoute.get(
    '/:id',
    checkPermission(PERMISSION.MANAGE_PRODUCT),
    productController.getProductById
);
productRoute.post(
    '/',
    checkPermission(PERMISSION.CREATE_PRODUCT),
    productController.createProductPost
);
productRoute.put(
    '/:id',
    checkPermission(PERMISSION.EDIT_PRODUCT),
    productController.updateProduct
);
productRoute.delete(
    '/:id',
    checkPermission(PERMISSION.DELETE_PRODUCT),
    productController.deleteProduct
);

module.exports = productRoute;
