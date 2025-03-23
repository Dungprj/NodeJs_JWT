const express = require('express');
const invoicePurcharseController = require('../../../controllers/user/invoicePurchase/invoicePurchaseController');
const checkPermission = require('../../../middleware/permission');
const categoryRoute = express.Router();

//Enum permission
const PERMISSION = require('../../../utils/permission');

categoryRoute.get(
    '/',
    checkPermission(PERMISSION.MANAGE_PURCHASES),
    invoicePurcharseController.getListInvoicePurchase
);
categoryRoute.get(
    '/:id',
    checkPermission(PERMISSION.MANAGE_PURCHASES),
    invoicePurcharseController.getInvoicePurchaseById
);
categoryRoute.post(
    '/',
    checkPermission(PERMISSION.MANAGE_PURCHASES),
    invoicePurcharseController.createInvoicePurchase
);
categoryRoute.put(
    '/:id',
    checkPermission(PERMISSION.MANAGE_PURCHASES),
    invoicePurcharseController.updateInvoicePurchase
);
categoryRoute.delete(
    '/:id',
    checkPermission(PERMISSION.MANAGE_PURCHASES),
    invoicePurcharseController.deleteInvoicePurchase
);

module.exports = categoryRoute;
