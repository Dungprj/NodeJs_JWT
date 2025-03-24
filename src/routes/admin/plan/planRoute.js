const express = require('express');
const planController = require('../../../controllers/admin/plan/planController');
const planRoutes = express.Router();
const checkPermission = require('../../../middleware/permission');
const PERMISSION = require('../../../utils/permission');

// planRoutes.get(
//     '/init',
//     // checkPermission(PERMISSION.CREATE_BRANCH),
//     planController.
// );

planRoutes.get(
    '/',
    // checkPermission(PERMISSION.MANAGE_BRANCH),
    planController.getListPlan
);
planRoutes.post(
    '/',
    // checkPermission(PERMISSION.CREATE_BRANCH),
    planController.createPlan
);
planRoutes.put(
    '/:id',
    // checkPermission(PERMISSION.EDIT_BRANCH),
    planController.updatePlan
);

module.exports = planRoutes;
