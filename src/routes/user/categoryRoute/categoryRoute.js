const express = require('express');
const categoryController = require('../../../controllers/user/category/categoryController');

const categoryRoute = express.Router();

categoryRoute.get('/', categoryController.getListCategory);
categoryRoute.get('/:id', categoryController.getCategoryById);
categoryRoute.post('/', categoryController.createCategory);
categoryRoute.put('/:id', categoryController.updateCategory);
categoryRoute.delete('/:id', categoryController.deleteCategory);

module.exports = categoryRoute;
