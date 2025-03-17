const express = require('express');
const productController = require('../../../controllers/user/products/productController');

const productRoute = express.Router();

productRoute.get('/create', productController.createProductGet);
productRoute.get('/', productController.getAllProducts);
productRoute.get('/:id', productController.getProductById);
productRoute.post('/', productController.createProductPost);
productRoute.put('/:id', productController.updateProduct);
productRoute.delete('/:id', productController.deleteProduct);

module.exports = productRoute;
