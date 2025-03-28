const express = require('express');
const vendorController = require('../../../controllers/user/vendor/vendorController');
const checkPermission = require('../../../middleware/permission');
const checkPlanLimits = require('../../../middleware/checkPlanLimits');
//Enum permission
const PERMISSION = require('../../../utils/permission');
const vendorRoutes = express.Router();

vendorRoutes.get(
    '/',
    checkPermission(PERMISSION.MANAGE_VENDOR),
    vendorController.getListVendor
);
vendorRoutes.post(
    '/',
    checkPermission(PERMISSION.CREATE_VENDOR),
    checkPlanLimits.vendor,
    vendorController.createVendor
);
vendorRoutes.put(
    '/:id',
    checkPermission(PERMISSION.EDIT_VENDOR),
    vendorController.updateVendor
);
vendorRoutes.delete(
    '/:id',
    checkPermission(PERMISSION.DELETE_VENDOR),
    vendorController.deleteVendor
);

module.exports = vendorRoutes;
