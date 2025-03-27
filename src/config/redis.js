const redis = require('redis');
require('dotenv').config();
// Tạo client Redis cho localhost
const redisClient = redis.createClient({
    url: process.env.REDIS_HOST || 'redis://localhost:6379' // Mặc định localhost, port 6379
});

// Xử lý sự kiện
redisClient.on('connect', () => {
    console.log('Connected to Redis on localhost');
});

redisClient.on('error', err => {
    console.error('Redis error:', err);
});

// Kết nối khi khởi động
(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
    }
})();

// Export client
module.exports = redisClient;
