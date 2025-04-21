const User = require('../db/models/user');
const Plan = require('../db/models/plan');

const Token = require('../db/models/token');
const RolePermission = require('../db/models/rolepermissions');
const Role = require('../db/models/roles');
const Permission = require('../db/models/permissions');
const { Op } = require('sequelize');
const moment = require('moment-timezone'); // Thêm thư viện moment-timezone

const commom = {
    formatCurrency: amount => {
        // Chuyển đổi amount thành số nếu nó là chuỗi
        const number = parseFloat(amount.toString().replace(/[^0-9.-]+/g, ''));
        return number.toLocaleString('vi-VN') + 'đ';
    },
    generateInvoiceUrl: invoiceData => {
        const data = { ...invoiceData };
        const jsonString = JSON.stringify(data);
        const safeString = encodeURIComponent(jsonString); // Xử lý ký tự Unicode
        const encodedData = btoa(safeString);

        const params = new URLSearchParams();
        params.set('data', encodedData);

        const baseUrl = process.env.BASE_URL_GENERATE_QR;
        return `${baseUrl}?${params.toString()}`;
    },

    calculateEndTime: (startTime, type) => {
        // Chuyển startTime thành đối tượng Date
        const startDate = new Date(startTime);

        // Kiểm tra startTime hợp lệ
        if (isNaN(startDate.getTime())) {
            throw new Error('Thời gian bắt đầu không hợp lệ');
        }

        // Tạo bản sao của startDate để tránh thay đổi giá trị gốc
        const endDate = new Date(startDate);

        // Xử lý theo type
        switch (type) {
            case 'month':
                endDate.setMonth(startDate.getMonth() + 1);
                break;
            case 'year':
                endDate.setFullYear(startDate.getFullYear() + 1);
                break;
            case 'Unlimited':
                endDate.setFullYear(startDate.getFullYear() + 100);
                break;
            default:
                throw new Error(
                    'Loại gói không hợp lệ. Chọn "month", "year" hoặc "Unlimited"'
                );
        }

        return endDate;
    },
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

    fomatTime: item => {
        if (Array.isArray(item) && item.length > 1) {
            return item.map(singleItem => ({
                ...singleItem.toJSON(),
                created_at: moment(singleItem.created_at)
                    .tz('Asia/Ho_Chi_Minh')
                    .format(),
                updated_at: moment(singleItem.updated_at)
                    .tz('Asia/Ho_Chi_Minh')
                    .format()
            }));
        }
        if (Array.isArray(item) && item.length == 1) {
            const formatted = item.map(singleItem => ({
                ...singleItem.toJSON(),
                created_at: moment(singleItem.created_at)
                    .tz('Asia/Ho_Chi_Minh')
                    .format(),
                updated_at: moment(singleItem.updated_at)
                    .tz('Asia/Ho_Chi_Minh')
                    .format()
            }));

            return formatted;
        }

        return {
            ...item.toJSON(),
            created_at: moment(item.created_at).tz('Asia/Ho_Chi_Minh').format(),
            updated_at: moment(item.updated_at).tz('Asia/Ho_Chi_Minh').format()
        };
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
