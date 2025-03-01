const User = require('../models/user');
require('dotenv').config();

const userService = {
    getListUserService: async () => {
        try {
            const users = await User.find({});
            return users;
        } catch (error) {
            console.log(error);
            return null;
        }
    },

    deleteUser: async id => {
        try {
            const user = await User.findById(id);
            if (!user)
                return {
                    message: 'User not found !'
                };
            const status = await User.deleteOne({ _id: id });
            return {
                message:
                    status.deletedCount > 0
                        ? 'Delete Successfully !'
                        : 'Deleted failed'
            };
        } catch (error) {
            console.log(error);
            return null;
        }
    },
    updateUser: async (id, data) => {
        try {
            const user = await User.findById(id);
            if (!user)
                return {
                    message: 'User not found !'
                };
            const status = await User.updateOne({ _id: id }, data);
            return {
                status: acknowledged
            };
        } catch (error) {
            console.log(error);
            return null;
        }
    }
};
module.exports = userService;
