const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config({ path: `${process.cwd()}/.env` });
const env = process.env.NODE_ENV || 'development';
const config = require('./config');
const sequelize = new Sequelize(config[env]);

// Export sequelize và các model
module.exports = sequelize;
