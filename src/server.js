require('dotenv').config();
const express = require('express'); //commonjs
const cookieParser = require('cookie-parser');

const cors = require('cors');
const middleware = require('./middleware/auth');
const middleWareNotFound = require('./middleware/notFound');

const middleWareError = require('./middleware/error');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const app = express();
const port = process.env.PORT || 8888;

//config cors

app.use(cors());
//config req.body
app.use(cookieParser());
app.use(express.json()); // for json
app.use(express.urlencoded({ extended: true })); // for form data

//khai báo route
app.use('/v1/auth', authRoutes);
//config middleware
app.use('/v1/user', middleware.auth, userRoutes);

// Middleware xử lý 404 - Đặt ở cuối cùng
app.use(middleWareNotFound.notFound);

// Middleware xử lý lỗi chung (nếu có lỗi xảy ra trong quá trình xử lý)
app.use(middleWareError.error);

(async () => {
    try {
        app.listen(port, () => {
            console.log(`>>> Connect to ${process.env.DB_NAME} successful`);
            console.log(`Backend Nodejs App listening on port ${port}`);
        });
    } catch (error) {
        console.log('>>> Error connect to DB: ', error);
    }
})();
