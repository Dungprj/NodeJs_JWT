const User = require('../models/user');
require('dotenv').config();

const pool = require('../config/db');

const userService = {
    getListUserService: async () => {
        try {
            const query = 'SELECT * FROM User';
            const [users, fields] = await pool.query(query);
            return users;
        } catch (error) {
            console.log(error);
            return null;
        }
    },
    deleteUser: async id => {
        try {
            const query = 'DELETE FROM User where id = ?';
            const [respone] = await pool.execute(query, [id]);
            return respone.affectedRows > 0;
        } catch (error) {
            console.log(error);
            return error;
        }
    },
    getUserByIdService: async id => {
        try {
            const query = 'SELECT * FROM User where id = ?';
            const [user] = await pool.query(query, [id]);
            return user;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    updateUser: async (id, data) => {
        try {
            //kiem tra user co ton tai hay chua
            const queryCheckExits = `SELECT * FROM User WHERE id = ?`;
            const [users] = await pool.execute(queryCheckExits, [id]);
            //neu user khong ton tai
            if (users.length < 0) {
                throw new Error('Email not exists');
            }

            const query = 'UPDATE User SET name = ?, email = ? WHERE id = ?';
            const [respone] = await pool.execute(query, [
                data.name ? data.name : users[0].name,
                data.email ? data.email : users[0].email,
                id
            ]);
            return respone.affectedRows > 0;
        } catch (error) {
            throw new Error(error.message);
        }
    }
};
module.exports = userService;
