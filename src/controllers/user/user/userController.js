const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const userService = require('../../../services/user/user/userService');

const userController = {
    getListUser: catchAsync(async (req, res) => {
        const user = req.user;
        const users = await userService.getListUser(user);
        return ApiResponse.success(
            res,
            users,
            'Lấy danh sách user thành công CỐC',
            200
        );
    }),

    getuserById: catchAsync(async (req, res) => {
        const userById = await userService.getUserById(req.params.id);
        return ApiResponse.success(
            res,
            userById,
            'Lấy thông tin user theo id thành công',
            200
        );
    }),

    AddUserInit: catchAsync(async (req, res) => {
        const user = req.user;
        const userInit = await userService.AddUserInit(user);
        return ApiResponse.success(
            res,
            userInit,
            'Lấy thông tin user thành công',
            200
        );
    }),

    handleActiveUser: catchAsync(async (req, res) => {
        const id = req.params.id;

        console.log('body: ' + JSON.stringify(req.body));
        const updatedUser = await userService.handleActiveUser(id, req.body);

        return ApiResponse.success(
            res,
            updatedUser,
            'Xử lý trạng thái user thành công',
            200
        );
    }),
    addUser: catchAsync(async (req, res) => {
        const user = req.user;
        const newUser = await userService.addUser(user, req.body);
        return ApiResponse.success(
            res,
            newUser,
            'Lấy thông tin user thành công',
            200
        );
    }),

    updateUser: catchAsync(async (req, res) => {
        const id = req.params.id;
        const updatedUser = await userService.updateUser(id, req.body);
        return ApiResponse.success(
            res,
            updatedUser,
            'Cập nhật thông tin user thành công',
            200
        );
    }),

    setAgainPassword: catchAsync(async (req, res) => {
        const id = req.params.id;

        await userService.setAgainPassword(id, req.body);
        return ApiResponse.success(
            res,
            null,
            'Đặt lại mật khẩu thành công',
            200
        );
    })
};

module.exports = userController;
