const express = require('express');
const branchController = require('../../../controllers/user/branch/branchController');

const branchRoutes = express.Router();

branchRoutes.get('/', branchController.getListBranches);
branchRoutes.post('/', branchController.createBranch);
branchRoutes.put('/:id', branchController.updateBranch);
branchRoutes.delete('/:id', branchController.deleteBranch);

module.exports = branchRoutes;
