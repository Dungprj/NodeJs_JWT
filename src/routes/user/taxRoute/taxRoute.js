const express = require('express');
const taxController = require('../../../controllers/user/tax/taxController');

const userProfileRoutes = express.Router();
const checkPermission = require('../../../middleware/permission');
//Enum permission
const PERMISSION = require('../../../utils/permission');

userProfileRoutes.get(
    '/',
    checkPermission(PERMISSION.MANAGE_TAX),
    taxController.getListTax
);
userProfileRoutes.post(
    '/',
    checkPermission(PERMISSION.CREATE_TAX),
    taxController.createTax
);
userProfileRoutes.put(
    '/:id',
    checkPermission(PERMISSION.EDIT_TAX),
    taxController.updateTax
);
userProfileRoutes.delete(
    '/:id',
    checkPermission(PERMISSION.DELETE_TAX),
    taxController.deleteTax
);

module.exports = userProfileRoutes;
