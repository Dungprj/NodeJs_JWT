const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const userService = require('../../../services/user/user/userService');

const userController = {
    getListUser: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const page = parseInt(req.query.page) || 1; // Lấy số trang từ query, mặc định là 1
        const limit = parseInt(req.query.limit) || 10;

        const users = await userService.getListUser(idQuery, page, limit);
        return ApiResponse.success(
            res,
            {
                lenght: users.length,
                users
            },
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
        const idQuery = req.idQuery;

        const userInit = await userService.AddUserInit(idQuery);
        return ApiResponse.success(
            res,
            userInit,
            'Lấy thông tin user thành công',
            200
        );
    }),

    handleActiveUser: catchAsync(async (req, res) => {
        const id = req.params.id;
        const idQuery = req.idQuery;
        const updatedUser = await userService.handleActiveUser(
            id,
            idQuery,
            req.body
        );

        return ApiResponse.success(
            res,
            updatedUser,
            'Xử lý trạng thái user thành công',
            200
        );
    }),
    addUser: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;

        const newUser = await userService.addUser(idQuery, req.body);
        return ApiResponse.success(res, newUser, 'Thêm user thành công', 200);
    }),

    updateUser: catchAsync(async (req, res) => {
        const id = req.params.id;
        const idQuery = req.idQuery;
        const updatedUser = await userService.updateUser(id, idQuery, req.body);
        return ApiResponse.success(
            res,
            updatedUser,
            'Cập nhật thông tin user thành công',
            200
        );
    }),

    setAgainPassword: catchAsync(async (req, res) => {
        const id = req.params.id;
        const idQuery = req.idQuery;
        await userService.setAgainPassword(id, idQuery, req.body);
        return ApiResponse.success(
            res,
            null,
            'Đặt lại mật khẩu thành công',
            200
        );
    })
};

module.exports = userController;
