const Role = require('../../../db/models/roles');
const Permission = require('../../../db/models/permissions');
const RolePermission = require('../../../db/models/rolepermissions');

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

        const withlist = ['Language'];

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

const roleService = {
    getListRole: async () => {
        //get List Permission

        console.log('data : ', permissions);
        console.log('length : ', permissions[0].length);

        return groupByLastWord(permissions[0]);
    },
    createRole: async (roleName, listPermission) => {
        // Bắt đầu transaction để đảm bảo toàn vẹn dữ liệu
        await sequelize.transaction(async t => {
            // 1. Tạo role
            const newRole = await Role.create(
                { name: roleName },
                { transaction: t }
            );

            // 2. Mảng permission_id
            const permissionIds = listPermission;

            // 3. Kiểm tra xem các permission này có tồn tại không
            const permissions = await Permission.findAll({
                where: {
                    id: permissionIds
                },
                transaction: t
            });

            if (permissions.length !== permissionIds.length) {
                throw new AppError(
                    'Not all permissions exist in the database',
                    404
                );
            }

            // 4. Gán permissions cho role qua bảng role_permission
            const rolePermissionData = permissionIds.map(permissionId => ({
                role_id: newRole.id,
                permission_id: permissionId
            }));

            await RolePermission.bulkCreate(rolePermissionData, {
                transaction: t
            });
        });
    }
};

module.exports = roleService;
