const express = require('express');
const customerController = require('../../../controllers/user/customer/customerController');
const checkPermission = require('../../../middleware/permission');
const customerRoute = express.Router();
const checkPlanLimits = require('../../../middleware/checkPlanLimits');

//Enum permission
const PERMISSION = require('../../../utils/permission');

customerRoute.get(
    '/',
    checkPermission(PERMISSION.MANAGE_CUSTOMER),
    customerController.getListCustomer
);
customerRoute.get(
    '/:id',
    checkPermission(PERMISSION.EDIT_CUSTOMER),
    customerController.getCustomerById
);
customerRoute.post(
    '/',
    checkPlanLimits.customer,
    checkPermission(PERMISSION.CREATE_CUSTOMER),
    customerController.createCustomer
);
customerRoute.put(
    '/:id',
    checkPermission(PERMISSION.EDIT_CUSTOMER),
    customerController.updateCustomer
);
customerRoute.delete(
    '/:id',
    checkPermission(PERMISSION.DELETE_CUSTOMER),
    customerController.deleteCustomer
);

module.exports = customerRoute;
