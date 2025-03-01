const express = require('express');

const userController = require('../controllers/userController');

const routerUser = express.Router();

const middleware = require('../middleware/auth');

routerUser.get('/', userController.getListUser);
routerUser.delete(
    '/:id',
    middleware.verifyTokenAdminAndYourself,
    userController.deleteUser
);
routerUser.put(
    '/:id',
    middleware.verifyTokenAdminAndYourself,
    userController.updateUser
);

module.exports = routerUser; //export default
