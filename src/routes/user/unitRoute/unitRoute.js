const express = require('express');
const unitController = require('../../../controllers/user/unit/unitController');

const unitRoute = express.Router();

unitRoute.get('/', unitController.getListUnit);
unitRoute.post('/', unitController.createUnit);
unitRoute.put('/:id', unitController.updateUnit);
unitRoute.delete('/:id', unitController.deleteUnit);

module.exports = unitRoute;
