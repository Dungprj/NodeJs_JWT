require('dotenv').config();
const Permission = require('../../../db/models/permissions');
const Role = require('../../../db/models/roles');
const RolePermission = require('../../../db/models/rolepermissions');
const { Op } = require('sequelize');
const AppError = require('../../../utils/appError');

const groupByLastWord = arr => {
    const result = {};
    const validLastWords = ['Manage', 'Create', 'Edit', 'Delete'];
    const order = ['Manage', 'Create', 'Edit', 'Delete'];
    const KeyAccount = 'Account';

    // Hàm lấy thứ tự ưu tiên của một chuỗi name
    const getPriority = name => {
        for (let i = 0; i < order.length; i++) {
            if (name.includes(order[i])) {
                return i; // Trả về chỉ số trong order
            }
        }
        return order.length; // Nếu không chứa từ nào, xếp cuối
    };

    // Hàm sắp xếp toàn bộ object
    const sortSubArrays = data => {
        for (const key in data) {
            data[key].sort((a, b) => {
                const priorityA = getPriority(a.name);
                const priorityB = getPriority(b.name);
                return priorityA - priorityB;
            });
        }
        return data;
    };

    arr.forEach(item => {
        // Tách chuỗi name thành mảng các từ và lấy từ cuối cùng
        const words = item.name.split(' ');
        const lastWord = words[words.length - 1];

        const withlist = [
            'Language',
            'Logos',
            'Purchases',
            'Sales',
            'Plan',
            'Order'
        ];

        //check xem có từ trong validLastWord không
        const hasMatch = words.some(cha => validLastWords.includes(cha));

        if (hasMatch && !withlist.includes(lastWord) && words.length == 2) {
            if (!result[lastWord]) {
                result[lastWord] = [];
            }
            result[lastWord].push(item);
        } else if (
            hasMatch &&
            !withlist.includes(lastWord) &&
            words.length == 3
        ) {
            const haiTuCuoi =
                words[words.length - 2] + ' ' + words[words.length - 1];
            if (!result[haiTuCuoi]) {
                result[haiTuCuoi] = [];
            }
            result[haiTuCuoi].push(item);
        } else if (
            hasMatch &&
            !withlist.includes(lastWord) &&
            words.length == 4
        ) {
            const baTuCuoi =
                words[words.length - 3] +
                ' ' +
                words[words.length - 2] +
                ' ' +
                words[words.length - 1];
            if (!result[baTuCuoi]) {
                result[baTuCuoi] = [];
            }
            result[baTuCuoi].push(item);
        } else {
            if (!result[KeyAccount]) {
                result[KeyAccount] = [];
            }
            result[KeyAccount].push(item);
        }

        // Nếu chưa có key này trong result, tạo mảng mới
    });
    const resultSorted = sortSubArrays(result);

    return resultSorted;
};

const permissionService = {
    getListPermissionInit: async typeQuery => {
        //get permissions by roleId = 2 and roleName = Onwer ngoại trừ buy plan and manager plan
        const permissions = await Permission.findAll({
            attributes: ['id', 'name'],
            include: [
                {
                    model: Role,
                    attributes: [],
                    as: 'Permission_roles',
                    where: {
                        name: typeQuery
                    },
                    through: {
                        model: RolePermission,
                        attributes: [],
                        as: 'Permission_roles'
                    }
                }
            ],
            where: {
                id: {
                    [Op.notIn]: [95, 98] // Loại trừ id 95 và 98 (manager plan and buy plan)
                }
            },
            raw: false
        });

        return groupByLastWord(permissions);
    },
    getMyPermission: async myType => {
        //get permissions by roleId = 2 and roleName = Onwer ngoại trừ buy plan and manager plan
        const permissions = await Permission.findAll({
            attributes: ['id', 'name'],
            include: [
                {
                    model: Role,
                    attributes: [],
                    as: 'Permission_roles',
                    where: {
                        name: myType
                    },
                    through: {
                        model: RolePermission,
                        attributes: [],
                        as: 'Permission_roles'
                    }
                }
            ],
            where: {
                id: {
                    [Op.notIn]: [95, 98] // Loại trừ id 95 và 98 (manager plan and buy plan)
                }
            },
            raw: false
        });

        return groupByLastWord(permissions);
    }
};

module.exports = permissionService;
