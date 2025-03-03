const express = require('express');

const userController = require('../controllers/userController');

const routerUser = express.Router();

const middleware = require('../middleware/auth');

routerUser.get('/', userController.getListUser);
routerUser.get('/:id', userController.getuserById);
routerUser.delete('/:id', userController.deleteUser);
routerUser.put('/:id', userController.updateUser);

module.exports = routerUser; //export default
