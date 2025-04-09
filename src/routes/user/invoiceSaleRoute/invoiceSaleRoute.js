const express = require('express');
const invoiceSaleController = require('../../../controllers/user/invoiceSale/invoiceSaleController');
const checkPermission = require('../../../middleware/permission');
const invoiceSaleRoute = express.Router();

//Enum permission
const PERMISSION = require('../../../utils/permission');

invoiceSaleRoute.get(
    '/',
    checkPermission(PERMISSION.MANAGE_SALES),
    invoiceSaleController.getListInvoiceSale
);

invoiceSaleRoute.get(
    '/getQRcode/:id',
    checkPermission(PERMISSION.MANAGE_SALES),
    invoiceSaleController.getQRcodeInvoiceSaleById
);
invoiceSaleRoute.get(
    '/:id',
    checkPermission(PERMISSION.MANAGE_SALES),
    invoiceSaleController.getInvoiceSaleById
);
invoiceSaleRoute.post(
    '/',
    checkPermission(PERMISSION.MANAGE_SALES),
    invoiceSaleController.createInvoiceSale
);
invoiceSaleRoute.put(
    '/:id',
    checkPermission(PERMISSION.MANAGE_SALES),
    invoiceSaleController.updateInvoiceSale
);
invoiceSaleRoute.delete(
    '/:id',
    checkPermission(PERMISSION.MANAGE_SALES),
    invoiceSaleController.deleteInvoiceSale
);

module.exports = invoiceSaleRoute;
