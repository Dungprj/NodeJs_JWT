const express = require('express');
const userProfileController = require('../../../controllers/user/user/userController');

const userRoute = express.Router();

userRoute.get('/', userProfileController.getListUser);
userRoute.get('/init', userProfileController.getUserInit);
userRoute.post('/', userProfileController.addUser);
userRoute.put('/handleStatus/:id', userProfileController.handleActiveUser);

// userProfileRoute.get('/:id', userProfileController.getuserById);
// userProfileRoute.delete('/:id', userProfileController.deleteUser);
userRoute.put('/:id', userProfileController.updateUser);
userRoute.put('/setPassword/:id', userProfileController.setAgainPassword);

module.exports = userRoute;
