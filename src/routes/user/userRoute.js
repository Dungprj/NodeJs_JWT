const express = require('express');

const taxRoutes = require('./taxRoute/taxRoute');
const unitRoutes = require('./unitRoute/unitRoute');
const brandRoutes = require('./brandRoute/brandRoute');
const categoryRoutes = require('./categoryRoute/categoryRoute');
const productRoutes = require('./productRoute/productRoute');
const branchRoutes = require('./branchRoute/branchRoute');
const CashRegisterRoutes = require('./cashRegisterRoute/cashRegisterRoute');

const userProfileRoutes = require('./userProfileRoute/userProfileRoute');

const routerUser = express.Router();

// Gộp các route con vào router chính
routerUser.use('/tax', taxRoutes);
routerUser.use('/unit', unitRoutes);
routerUser.use('/brand', brandRoutes);
routerUser.use('/category', categoryRoutes);
routerUser.use('/product', productRoutes);
routerUser.use('/branch', branchRoutes);
routerUser.use('/cashRegister', CashRegisterRoutes);

routerUser.use('/', userProfileRoutes);

module.exports = routerUser;
