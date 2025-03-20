const express = require('express');
const permissionController = require('../../../controllers/user/permission/permissionController');

const permissionRoute = express.Router();

permissionRoute.get('/', permissionController.getListPermission);
// permissionRoute.get('/:id', permissionController.getCategoryById);
// permissionRoute.post('/', permissionController.createCategory);
// permissionRoute.put('/:id', permissionController.updateCategory);
// permissionRoute.delete('/:id', permissionController.deleteCategory);

module.exports = permissionRoute;
