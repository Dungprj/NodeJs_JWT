const { Sequelize } = require('sequelize');
require('dotenv').config();

// Khởi tạo kết nối tới MySQL với Sequelize
const sequelize = new Sequelize(
    process.env.DB_NAME, // Tên database
    process.env.DB_USER, // Username
    process.env.DB_PASSWORD, // Password
    {
        host: process.env.DB_HOST, // Host
        port: process.env.DB_PORT, // Port
        dialect: 'mysql', // Loại database
        logging: false, // Tắt log SQL nếu không muốn thấy
        pool: {
            // Cấu hình pool (tương tự createPool của mysql2)
            max: 10, // Số kết nối tối đa
            min: 0, // Số kết nối tối thiểu
            acquire: 30000, // Thời gian tối đa để lấy kết nối (ms)
            idle: 10000 // Thời gian tối đa một kết nối có thể nghỉ (ms)
        }
    }
);

module.exports = sequelize;
