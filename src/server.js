require('dotenv').config();
const express = require('express'); //commonjs
const cookieParser = require('cookie-parser');

const cors = require('cors');

const middleware = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const sysDb = require('./config/sysDb');

const app = express();
const port = process.env.PORT || 8888;

//config cors

app.use(cors());
//config req.body
app.use(cookieParser());
app.use(express.json()); // for json
app.use(express.urlencoded({ extended: true })); // for form data

app.use(middleware.auth);
//khai báo route
app.use('/v1/auth/', authRoutes);
//config middleware

app.use('/v1/user', userRoutes);

(async () => {
    try {
        // Đồng bộ hóa cơ sở dữ liệu trước khi khởi chạy ứng dụng
        await sysDb();

        app.listen(port, () => {
            console.log(`Backend Nodejs App listening on port ${port}`);
        });
    } catch (error) {
        console.log('>>> Error connect to DB: ', error);
    }
})();
