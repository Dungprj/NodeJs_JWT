const redis = require('redis');
require('dotenv').config();
// Tạo client Redis cho localhost
const redisClient = redis.createClient({
    url: process.env.REDIS_HOST || 'redis://localhost:6388' // Mặc định localhost, port 6379
});

//redis cloud
// const redisClient = redis.createClient({
//     username: process.env.REDIS_USERNAME,
//     password: process.env.REDIS_PASSWORD,
//     socket: {
//         host: process.env.REDIS_HOST,
//         port: process.env.REDIS_PORT
//     }
// });
// Xử lý sự kiện
redisClient.on('connect', () => {
    console.log('Connected to Redis :', process.env.REDIS_HOST);
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
