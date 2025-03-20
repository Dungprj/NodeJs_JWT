const express = require('express');
const roleController = require('../../../controllers/user/role/roleController');

const roleRoute = express.Router();

roleRoute.get('/', roleController.getListRole);
// roleRoute.get('/', roleController.getAllProducts);
// roleRoute.get('/:id', roleController.getProductById);
roleRoute.post('/', roleController.createRole);
roleRoute.put('/:id', roleController.updateRole);
roleRoute.delete('/:id', roleController.deleteRole);

module.exports = roleRoute;
