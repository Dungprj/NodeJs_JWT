const express = require('express');
const userProfileController = require('../../../controllers/user/profile/userProfileController');

const userProfileRoute = express.Router();

userProfileRoute.get('/', userProfileController.getProfile);
userProfileRoute.put('/', userProfileController.updateProfile);
module.exports = userProfileRoute;
