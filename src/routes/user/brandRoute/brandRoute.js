const express = require('express');
const brandController = require('../../../controllers/user/brand/brandController');

const brandRoutes = express.Router();

brandRoutes.get('/', brandController.getListBrand);
brandRoutes.post('/', brandController.createBrand);
brandRoutes.put('/:id', brandController.updateBrand);
brandRoutes.delete('/:id', brandController.deleteBrand);

module.exports = brandRoutes;
