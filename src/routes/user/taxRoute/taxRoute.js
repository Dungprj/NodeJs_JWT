const express = require('express');
const taxController = require('../../../controllers/user/tax/taxController');

const userProfileRoutes = express.Router();

userProfileRoutes.get('/', taxController.getListTax);
userProfileRoutes.post('/', taxController.createTax);
userProfileRoutes.put('/:id', taxController.updateTax);
userProfileRoutes.delete('/:id', taxController.deleteTax);

module.exports = userProfileRoutes;
