const express = require('express');
const brandController = require('../../../controllers/user/brand/brandController');
const brandRoutes = express.Router();
const checkPermission = require('../../../middleware/permission');
const PERMISSION = require('../../../utils/permission');

brandRoutes.get(
    '/',
    checkPermission(PERMISSION.MANAGE_BRAND),
    brandController.getListBrand
);
brandRoutes.get(
    '/:id',
    checkPermission(PERMISSION.MANAGE_BRAND),
    brandController.getBrandById
);
brandRoutes.post(
    '/',
    checkPermission(PERMISSION.CREATE_BRAND),
    brandController.createBrand
);
brandRoutes.put(
    '/:id',
    checkPermission(PERMISSION.EDIT_BRAND),
    brandController.updateBrand
);
brandRoutes.delete(
    '/:id',
    checkPermission(PERMISSION.DELETE_BRAND),
    brandController.deleteBrand
);

module.exports = brandRoutes;
