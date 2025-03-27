const express = require('express');
const unitController = require('../../../controllers/user/unit/unitController');
const checkPermission = require('../../../middleware/permission');
//Enum permission
const PERMISSION = require('../../../utils/permission');
const unitRoute = express.Router();

unitRoute.get(
    '/',
    checkPermission(PERMISSION.MANAGE_UNIT),
    unitController.getListUnit
);
unitRoute.post(
    '/',
    checkPermission(PERMISSION.CREATE_UNIT),
    unitController.createUnit
);
unitRoute.put(
    '/:id',
    checkPermission(PERMISSION.EDIT_UNIT),
    unitController.updateUnit
);
unitRoute.delete(
    '/:id',
    checkPermission(PERMISSION.DELETE_UNIT),
    unitController.deleteUnit
);

module.exports = unitRoute;
