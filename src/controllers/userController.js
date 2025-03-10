const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const userService = require('../services/userService');

const userController = {
    getListUser: catchAsync(async (req, res) => {
        // Lấy page và limit từ query params, mặc định là page=1, limit=10
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Gọi service để lấy danh sách người dùng
        const data = await userService.getListUserService(page, limit);
        return res.status(200).json(data);
    }),
    getuserById: async (req, res) => {
        const data = await userService.getUserByIdService(req.params.id);
        return res.status(200).json(data);
    },

    deleteUser: async (req, res) => {
        try {
            const respone = await userService.deleteUser(req.params.id);
            return respone
                ? res.status(200).json('Delete successfully')
                : res.status(404).json('Delete failed');
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    updateUser: async (req, res) => {
        try {
            const response = await userService.updateUser(
                req.params.id,
                req.body
            );
            return response
                ? res.status(200).json('Update successfully')
                : res.status(404).json('Update failed');
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};

module.exports = userController;
