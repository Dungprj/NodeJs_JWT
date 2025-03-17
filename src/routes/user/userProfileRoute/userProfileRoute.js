const express = require('express');
const userProfileController = require('../../../controllers/user/profile/userProfileController');

const userProfileRoute = express.Router();

userProfileRoute.get('/', userProfileController.getListUser);
userProfileRoute.get('/:id', userProfileController.getuserById);
userProfileRoute.delete('/:id', userProfileController.deleteUser);
userProfileRoute.put('/:id', userProfileController.updateUser);

module.exports = userProfileRoute;
