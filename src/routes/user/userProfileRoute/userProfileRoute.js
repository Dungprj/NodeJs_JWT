const express = require('express');
const userProfileController = require('../../../controllers/user/profile/userProfileController');

const userProfileRoute = express.Router();
const checkPermission = require('../../../middleware/permission');
//Enum permission
const PERMISSION = require('../../../utils/permission');

userProfileRoute.get(
    '/',
    checkPermission(PERMISSION.MANAGE_PROFILE),
    userProfileController.getProfile
);
userProfileRoute.put(
    '/',
    checkPermission(PERMISSION.EDIT_PROFILE),
    userProfileController.updateProfile
);
userProfileRoute.delete(
    '/:id',
    checkPermission(PERMISSION.DELETE_PROFILE),
    userProfileController.deleteProfile
);

module.exports = userProfileRoute;
