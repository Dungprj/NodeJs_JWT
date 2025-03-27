require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const sequelize = require('./config/database');
const cors = require('cors');
const redisClient = require('./config/redis'); // Import để khởi tạo kết nối
const middleware = require('./middleware/auth');
const authRoutes = require('./routes/common/auth');
const userRoutes = require('./routes/user/userRoute');
const adminRoutes = require('./routes/admin/adminRoute');
const testRoutes = require('./routes/test/testRoute');

const globalErrorHandler = require('./controllers/common/errorController');
const AppError = require('./utils/appError');
const path = require('path');
const app = express();
const port = process.env.PORT || 8888;

// Config CORS
app.use(cors());

// Config req.body
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Config upload folder
const uploadFolder = process.env.UPLOADS_FOLDER || 'uploads';
// Phục vụ file tĩnh từ thư mục public (ảnh mặc định)
app.use('/public', express.static(path.join(__dirname, 'public')));
// Phục vụ file tĩnh từ thư mục uploads
app.use(`/${uploadFolder}`, express.static(path.join(__dirname, uploadFolder)));
// Routes
app.use('/v1/auth/', authRoutes); // Không cần auth middleware
app.use('/v1/admin', middleware.auth, adminRoutes); // Bảo vệ route user
app.use('/v1/test', middleware.auth, testRoutes); // Bảo vệ route user
app.use('/v1/user', middleware.auth, userRoutes); // Bảo vệ route user

// Xử lý 404
app.use('*', (req, res, next) => {
    return next(
        new AppError(`Can't find ${req.originalUrl} on this server`, 404)
    );
});

// Xử lý lỗi toàn cục
app.use(globalErrorHandler);

// Khởi động server
(async () => {
    try {
        await sequelize.authenticate();
        console.log(`>>> Connect to ${process.env.DB_USERNAME} successful`);
        await sequelize.sync({ force: false });
        console.log('Đồng bộ model thành công!');
        app.listen(port, () => {
            console.log(`Backend Nodejs App listening on port ${port}`);
        });
    } catch (error) {
        console.log('>>> Error connect to DB: ', error);
        process.exit(1);
    }
})();
