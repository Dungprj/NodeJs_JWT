const express = require('express');
const roleController = require('../../../controllers/user/role/roleController');

const roleRoute = express.Router();
const checkPermission = require('../../../middleware/permission');
//Enum permission
const PERMISSION = require('../../../utils/permission');

roleRoute.get(
    '/',
    checkPermission(PERMISSION.MANAGE_ROLE),
    roleController.getListRole
);
// roleRoute.get('/', roleController.getAllProducts);
roleRoute.post(
    '/',
    checkPermission(PERMISSION.CREATE_ROLE),
    roleController.createRole
);
roleRoute.put(
    '/:id',
    checkPermission(PERMISSION.EDIT_ROLE),
    roleController.updateRole
);
roleRoute.delete(
    '/:id',
    checkPermission(PERMISSION.DELETE_ROLE),
    roleController.deleteRole
);

module.exports = roleRoute;
