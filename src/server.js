require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const sequelize = require('./config/database');
const cors = require('cors');

const middleware = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();
const port = process.env.PORT || 8888;

// Config CORS
app.use(cors());

// Config req.body
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/v1/auth/', authRoutes); // Không cần auth middleware
app.use('/v1/user', middleware.auth, userRoutes); // Bảo vệ route user

// Xử lý 404
app.use('*', (req, res, next) => {
    throw new AppError(`Can't find ${req.originalUrl} on this server`, 404);
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
