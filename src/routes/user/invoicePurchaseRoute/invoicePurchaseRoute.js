const express = require('express');
const invoicePurcharseController = require('../../../controllers/user/invoicePurchase/invoicePurchaseController');
const checkPermission = require('../../../middleware/permission');
const invoicePurchaseRoute = express.Router();

//Enum permission
const PERMISSION = require('../../../utils/permission');

invoicePurchaseRoute.get(
    '/',
    checkPermission(PERMISSION.MANAGE_PURCHASES),
    invoicePurcharseController.getListInvoicePurchase
);
invoicePurchaseRoute.get(
    '/:id',
    checkPermission(PERMISSION.MANAGE_PURCHASES),
    invoicePurcharseController.getInvoicePurchaseById
);
invoicePurchaseRoute.post(
    '/',
    checkPermission(PERMISSION.MANAGE_PURCHASES),
    invoicePurcharseController.createInvoicePurchase
);
invoicePurchaseRoute.put(
    '/:id',
    checkPermission(PERMISSION.MANAGE_PURCHASES),
    invoicePurcharseController.updateInvoicePurchase
);
invoicePurchaseRoute.delete(
    '/:id',
    checkPermission(PERMISSION.MANAGE_PURCHASES),
    invoicePurcharseController.deleteInvoicePurchase
);

module.exports = invoicePurchaseRoute;
