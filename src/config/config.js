// config.js
require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        port: process.env.DB_PORT,
        seederStorage: 'sequelize',
        timezone: process.env.DB_TIMEZONE,
        dialectOptions: {
            timezone: process.env.DB_TIMEZONE // Đảm bảo Sequelize sử dụng đúng múi giờ
        }
    },
    test: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        port: process.env.DB_PORT,
        seederStorage: 'sequelize',
        timezone: process.env.DB_TIMEZONE,
        dialectOptions: {
            timezone: process.env.DB_TIMEZONE // Đảm bảo Sequelize sử dụng đúng múi giờ
        }
    },
    production: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        port: process.env.DB_PORT,
        seederStorage: 'sequelize',
        timezone: process.env.DB_TIMEZONE,
        dialectOptions: {
            timezone: process.env.DB_TIMEZONE // Đảm bảo Sequelize sử dụng đúng múi giờ
        }
    }
};
