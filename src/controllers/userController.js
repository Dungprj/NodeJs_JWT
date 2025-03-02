const userService = require('../services/userService');

const userController = {
    getListUser: async (req, res) => {
        const data = await userService.getListUserService2();
        return res.status(200).json(data);
    },
    getuserById: async (req, res) => {
        const data = await userService.getUserByIdService(req.params.id);
        return res.status(200).json(data);
    },

    deleteUser: async (req, res) => {
        try {
            const respone = await userService.deleteUser2(req.params.id);
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
            const response = await userService.updateUser2(
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
