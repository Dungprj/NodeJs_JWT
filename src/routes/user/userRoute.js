const express = require('express');

const taxRoutes = require('./taxRoute/taxRoute');
const unitRoutes = require('./unitRoute/unitRoute');
const brandRoutes = require('./brandRoute/brandRoute');
const categoryRoutes = require('./categoryRoute/categoryRoute');
const productRoutes = require('./productRoute/productRoute');
const branchRoutes = require('./branchRoute/branchRoute');
const roleRoutes = require('./roleRoute/roleRoute');
const permissionRoutes = require('./permissionRoute/permissionRoute');

const CashRegisterRoutes = require('./cashRegisterRoute/cashRegisterRoute');
const userProfileRoutes = require('./userProfileRoute/userProfileRoute');
const userManagerRoutes = require('./managerUserRoute/managerUserRoute');
const vendorRoutes = require('./vendorRoute/vendorRoute');
const customerRoutes = require('./customerRoute/customerRoute');

const categroyExpenseRoutes = require('./categoryExpenseRoute/categoryExpenseRoute');
const expenseRoutes = require('./expensiveRoute/expensiveRoute');
const planRoutes = require('./plan/planRoute');

const productReturnRoutes = require('./productReturnRoute/productReturnRoute');

const invoicePurcharseRoutes = require('./invoicePurchaseRoute/invoicePurchaseRoute');
const invoiceSaleRoutes = require('./invoiceSaleRoute/invoiceSaleRoute');
const checkPlanExpire = require('../../middleware/checkPlanExpire');

const routerUser = express.Router();

routerUser.use(checkPlanExpire);
// Gộp các route con vào router chính
routerUser.use('/tax', taxRoutes);
routerUser.use('/unit', unitRoutes);
routerUser.use('/brand', brandRoutes);
routerUser.use('/category', categoryRoutes);
routerUser.use('/product', productRoutes);
routerUser.use('/branch', branchRoutes);
routerUser.use('/role', roleRoutes);
routerUser.use('/permission', permissionRoutes);
routerUser.use('/cashRegister', CashRegisterRoutes);
routerUser.use('/managerUser', userManagerRoutes);
routerUser.use('/purchase', invoicePurcharseRoutes);
routerUser.use('/sale', invoiceSaleRoutes);
routerUser.use('/vendor', vendorRoutes);
routerUser.use('/customer', customerRoutes);
routerUser.use('/productReturn', productReturnRoutes);
routerUser.use('/profile', userProfileRoutes);
routerUser.use('/categoryExpense', categroyExpenseRoutes);
routerUser.use('/plan', planRoutes);

routerUser.use('/expense', expenseRoutes);

module.exports = routerUser;
