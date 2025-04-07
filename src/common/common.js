const User = require('../db/models/user');
const Token = require('../db/models/token');
const RolePermission = require('../db/models/rolepermissions');
const Role = require('../db/models/roles');
const Permission = require('../db/models/permissions');
const { Op } = require('sequelize');
const commom = {
    getListPermission: async type => {
        const permissions = await Permission.findAll({
            attributes: ['id', 'name'],
            include: [
                {
                    model: Role,
                    attributes: [],
                    as: 'Permission_roles',
                    where: {
                        name: type
                    },
                    through: {
                        model: RolePermission,
                        attributes: [],
                        as: 'Permission_roles'
                    }
                }
            ],

            raw: false
        });

        return permissions;
    },
    // Hàm chuyển đổi chuỗi thành slug
    generateSlug: str => {
        // Chuyển thành chữ thường
        str = str.toLowerCase();
        str = str.replace(/đ/g, 'd');
        // Thay thế các ký tự có dấu thành không dấu
        str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        // Thay khoảng trắng bằng dấu gạch nối và giữ nguyên số
        // Xóa các ký tự đặc biệt không mong muốn (nếu có), giữ nguyên chữ cái, số và dấu
        str = str.replace(/\s+/g, '-');
        // // Xóa các dấu gạch nối dư thừa
        str = str.replace(/\-\-+/g, '-').trim();
        return str;
    },
    // Hàm chuyển đổi định dạng thời gian từ chuỗi sang milliseconds
    parseDurationToMilliseconds: duration => {
        const units = {
            s: 1000, // seconds
            m: 1000 * 60, // minutes
            h: 1000 * 60 * 60, // hours
            d: 1000 * 60 * 60 * 24, // days
            y: 1000 * 60 * 60 * 24 * 365 // years
        };

        const match = duration.match(/^(\d+)([smhdy])$/);
        if (!match) {
            throw new Error(`Invalid duration format: ${duration}`);
        }

        const value = parseInt(match[1], 10);
        const unit = match[2];
        return value * units[unit];
    },
    LogoutTaiKhoanNhanVien: async idParent => {
        try {
            // Lấy danh sách id nhân viên
            const users = await User.findAll({
                where: {
                    parent_id: idParent
                }
            });

            // Nếu không có nhân viên nào, dừng lại
            if (users.length === 0) {
                return;
            }

            // Lấy tất cả các token của người dùng có idParent
            const tokens = await Token.findAll({
                where: {
                    userId: {
                        [Op.in]: users.map(u => u.id) // Sửa lại biến `user` tránh trùng tên
                    }
                }
            });

            // Nếu không có token nào, dừng lại
            if (tokens.length === 0) {
                return;
            }

            // Xóa tất cả các token
            await Promise.all(tokens.map(token => token.destroy()));
        } catch (error) {
            console.error(
                'Có lỗi xảy ra khi đăng xuất tài khoản nhân viên: ',
                error
            );
            throw error;
        }
    }
};

module.exports = commom;
