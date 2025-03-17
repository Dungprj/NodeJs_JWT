const express = require('express');

const authController = require('../../controllers/common/authController');
const middleware = require('../../middleware/auth');

const routerAuth = express.Router();

routerAuth.post('/register', authController.handleRegister);
routerAuth.post('/login', authController.handleLogin);
routerAuth.put('/logout', authController.logout);
routerAuth.post('/refresh', authController.requestRefreshToken);

//vô hiệu hóa token
routerAuth.put('/disableRefreshToken', authController.disableRefreshToken);
routerAuth.put('/disableAccessToken', authController.disableAccessToken);
routerAuth.put('/disableBothToken', authController.disableBothToken);

module.exports = routerAuth; //export default
