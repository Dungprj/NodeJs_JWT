const express = require('express');
const productController = require('../../../controllers/user/products/productController');

const productRoute = express.Router();

productRoute.get('/', productController.getAllProducts);
productRoute.get('/:id', productController.getProductById);
productRoute.post('/', productController.createProduct);
productRoute.put('/:id', productController.updateProduct);
productRoute.delete('/:id', productController.deleteProduct);

module.exports = productRoute;
