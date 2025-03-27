const express = require('express');
const userProfileController = require('../../../controllers/user/user/userController');
const checkPlanLimits = require('../../../middleware/checkPlanLimits');
const userRoute = express.Router();
const checkPermission = require('../../../middleware/permission');
//Enum permission
const PERMISSION = require('../../../utils/permission');
// Lấy danh sách users
userRoute.get(
    '/',
    checkPermission(PERMISSION.MANAGE_USER),
    userProfileController.getListUser
);

// Lấy dữ liệu khởi tạo để thêm user (không hoàn toàn RESTful nhưng chấp nhận được)
userRoute.get(
    '/init',
    checkPermission(PERMISSION.MANAGE_USER),
    userProfileController.AddUserInit
);

// Tạo user mới
userRoute.post(
    '/',
    checkPermission(PERMISSION.CREATE_USER),
    checkPlanLimits.user,
    userProfileController.addUser
);

// Lấy thông tin user theo id
userRoute.get(
    '/:id',
    checkPermission(PERMISSION.MANAGE_USER),
    userProfileController.getuserById
);

// Cập nhật toàn bộ thông tin user
userRoute.put(
    '/:id',
    checkPermission(PERMISSION.EDIT_USER),
    userProfileController.updateUser
);

// Cập nhật một phần thông tin user (ví dụ: chỉ trạng thái hoặc mật khẩu)
userRoute.patch(
    '/:id',
    checkPermission(PERMISSION.EDIT_USER),
    userProfileController.updateUser
); // Có thể dùng chung với PUT nếu logic linh hoạt
userRoute.patch(
    '/:id/active',
    checkPermission(PERMISSION.EDIT_USER),
    userProfileController.handleActiveUser
); // Cập nhật trạng thái
userRoute.patch(
    '/:id/password',
    checkPermission(PERMISSION.EDIT_USER),
    userProfileController.setAgainPassword
); // Đặt lại mật khẩu

// Xóa user
// userRoute.delete('/:id', userProfileController.delete);

module.exports = userRoute;
