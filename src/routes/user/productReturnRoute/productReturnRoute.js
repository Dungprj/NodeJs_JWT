const express = require('express');
const productReturnController = require('../../../controllers/user/productReturn/productReturnController');
const checkPermission = require('../../../middleware/permission');
const productReturnRoute = express.Router();

//Enum permission
const PERMISSION = require('../../../utils/permission');

productReturnRoute.get('/', productReturnController.getListProductReturn);
productReturnRoute.get('/:id', productReturnController.getProductReturnById);
productReturnRoute.post('/', productReturnController.createProductReturn);
productReturnRoute.put('/:id', productReturnController.updateProductReturn);
productReturnRoute.delete('/:id', productReturnController.deleteProductReturn);

module.exports = productReturnRoute;
