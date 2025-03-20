const express = require('express');
const roleController = require('../../../controllers/user/role/roleController');

const roleRoute = express.Router();

roleRoute.get('/init', roleController.getListRoleInit);
// roleRoute.get('/', roleController.getAllProducts);
// roleRoute.get('/:id', roleController.getProductById);
// roleRoute.post('/', roleController.createProductPost);
// roleRoute.put('/:id', roleController.updateProduct);
// roleRoute.delete('/:id', roleController.deleteProduct);

module.exports = roleRoute;
