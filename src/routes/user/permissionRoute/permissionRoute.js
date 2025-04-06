const express = require('express');
const permissionController = require('../../../controllers/user/permission/permissionController');

const permissionRoute = express.Router();

permissionRoute.get('/init', permissionController.getListPermissionInit);

permissionRoute.get('/myPermission', permissionController.getMyPermission);
// permissionRoute.post('/', permissionController.createCategory);
// permissionRoute.put('/:id', permissionController.updateCategory);
// permissionRoute.delete('/:id', permissionController.deleteCategory);

module.exports = permissionRoute;
