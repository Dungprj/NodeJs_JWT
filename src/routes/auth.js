const express = require('express');

const authController = require('../controllers/authController');

const routerAuth = express.Router();

routerAuth.post('/register', authController.handleRegister);
routerAuth.post('/login', authController.handleLogin);
routerAuth.post('/logout', authController.logout);
routerAuth.post('/refresh', authController.requestRefreshToken);
routerAuth.patch('/changePassword', authController.handleChangePassword);

module.exports = routerAuth; //export default
