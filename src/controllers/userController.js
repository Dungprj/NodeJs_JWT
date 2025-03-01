const userService = require('../services/userService');

const userController = {
    getListUser: async (req, res) => {
        const data = await userService.getListUserService();
        return res.status(200).json(data);
    },
    deleteUser: async (req, res) => {
        try {
            const data = await userService.deleteUser(req.params.id);
            return res.status(200).json(data);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    updateUser: async (req, res) => {
        try {
            const User = require('../models/user');
            const user = await User.findById(req.params.id);
            if (!user)
                return res.status(404).json({ message: 'User not found !' });
            const data = await userService.updateUser(req.params.id, {
                user,
                ...req.body
            });
            return res.status(200).json(data);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};

module.exports = userController;
