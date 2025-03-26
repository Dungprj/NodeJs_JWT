const express = require('express');

const vendorRoute = require('./vendor/vendorRoute');

const routerTest = express.Router();

// Gộp các route con vào router chính
routerTest.use('/vendor', vendorRoute);

module.exports = routerTest;
