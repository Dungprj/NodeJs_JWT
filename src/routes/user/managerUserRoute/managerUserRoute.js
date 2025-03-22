const express = require('express');
const userProfileController = require('../../../controllers/user/user/userController');

const userRoute = express.Router();

// Lấy danh sách users
userRoute.get('/', userProfileController.getListUser);

// Lấy dữ liệu khởi tạo để thêm user (không hoàn toàn RESTful nhưng chấp nhận được)
userRoute.get('/init', userProfileController.AddUserInit);

// Tạo user mới
userRoute.post('/', userProfileController.addUser);

// Lấy thông tin user theo id
userRoute.get('/:id', userProfileController.getuserById);

// Cập nhật toàn bộ thông tin user
userRoute.put('/:id', userProfileController.updateUser);

// Cập nhật một phần thông tin user (ví dụ: chỉ trạng thái hoặc mật khẩu)
userRoute.patch('/:id', userProfileController.updateUser); // Có thể dùng chung với PUT nếu logic linh hoạt
userRoute.patch('/:id/active', userProfileController.handleActiveUser); // Cập nhật trạng thái
userRoute.patch('/:id/password', userProfileController.setAgainPassword); // Đặt lại mật khẩu

// Xóa user
// userRoute.delete('/:id', userProfileController.deleteUser);

module.exports = userRoute;
