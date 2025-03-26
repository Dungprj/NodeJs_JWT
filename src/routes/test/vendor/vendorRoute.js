const express = require('express');
const vendorController = require('../../../controllers/test/user/vendor/vendorController');
const checkPermission = require('../../../middleware/permission');
const checkPlanLimits = require('../../../middleware/checkPlanLimits');

const vendorRoutes = express.Router();

vendorRoutes.post('/', checkPlanLimits.vendor, vendorController.createVendor);

module.exports = vendorRoutes;
