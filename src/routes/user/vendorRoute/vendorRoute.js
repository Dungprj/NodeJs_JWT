const express = require('express');
const vendorController = require('../../../controllers/user/vendor/vendorController');
const checkPermission = require('../../../middleware/permission');
const checkPlanLimits = require('../../../middleware/checkPlanLimits');

const vendorRoutes = express.Router();

vendorRoutes.get('/', vendorController.getListVendor);
vendorRoutes.post('/', vendorController.createVendor);
vendorRoutes.put('/:id', vendorController.updateVendor);
vendorRoutes.delete('/:id', vendorController.updateVendor);

module.exports = vendorRoutes;
