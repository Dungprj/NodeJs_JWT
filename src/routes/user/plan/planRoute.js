const express = require('express');
const planController = require('../../../controllers/admin/plan/planController');
const planRoutes = express.Router();
const checkPermission = require('../../../middleware/permission');
const PERMISSION = require('../../../utils/permission');

planRoutes.get(
    '/',

    planController.getListPlan
);

planRoutes.get(
    '/:id',

    planController.getPlanById
);

module.exports = planRoutes;
