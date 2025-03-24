const express = require('express');

const planRoutes = require('./plan/planRoute');

const routerAdmin = express.Router();

routerAdmin.use('/plan', planRoutes);

module.exports = routerAdmin;
