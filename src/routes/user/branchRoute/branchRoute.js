const express = require('express');
const branchController = require('../../../controllers/user/branch/branchController');
const branchRoutes = express.Router();
const checkPermission = require('../../../middleware/permission');
const PERMISSION = require('../../../utils/permission');

branchRoutes.get(
    '/init',
    checkPermission(PERMISSION.CREATE_BRANCH),
    branchController.getInitBranch
);

branchRoutes.get(
    '/',
    checkPermission(PERMISSION.MANAGE_BRANCH),
    branchController.getListBranches
);
branchRoutes.get(
    '/:id',
    checkPermission(PERMISSION.MANAGE_BRANCH),
    branchController.getBranchById
);
branchRoutes.post(
    '/',
    checkPermission(PERMISSION.CREATE_BRANCH),
    branchController.createBranch
);
branchRoutes.put(
    '/:id',
    checkPermission(PERMISSION.EDIT_BRANCH),
    branchController.updateBranch
);
branchRoutes.delete(
    '/:id',
    checkPermission(PERMISSION.DELETE_BRANCH),
    branchController.deleteBranch
);

module.exports = branchRoutes;
