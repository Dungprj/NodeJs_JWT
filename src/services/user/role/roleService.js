const Role = require('../../../db/models/roles');
const Permission = require('../../../db/models/permissions');
const RolePermission = require('../../../db/models/rolepermissions');
const { Op } = require('sequelize');

const sequelize = require('../../../config/database');
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

const roleService = {
    getListRole: async user => {
        const roles = await Role.findAll({
            attributes: ['id', 'name'],
            include: [
                {
                    model: Permission,
                    group: ['name'],
                    attributes: ['id', 'name'],
                    as: 'Role_Permission',

                    through: {
                        model: RolePermission,
                        attributes: [],
                        as: 'Role_Permission'
                    }
                }
            ],
            where: { created_by: user.id },
            raw: false
        });

        if (roles.length === 0) {
            throw new AppError('List role not found', 404);
        }

        return roles;
    },
    createRole: async (data, user) => {
        // Bắt đầu transaction để đảm bảo toàn vẹn dữ liệu
        const result = await sequelize.transaction(async t => {
            // 1. Tạo role
            const newRole = await Role.create(
                {
                    name: data.name,
                    created_by: user.id,
                    guard_name: data.guard_name
                },
                { transaction: t }
            );

            if (data.permissions) {
                // 2. Mảng permission_id
                const permissionIds = data.permissions;

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
            }
        });

        return result;
    },
    updatePermissionsForRole: async (user, roleId, data) => {
        const { permissions: permissionIds, name } = data; // Destructure data

        // Kiểm tra đầu vào
        if (!roleId) {
            throw new AppError('Role ID is required', 400);
        }

        // Thực hiện tất cả trong một transaction
        const result = await sequelize.transaction(async t => {
            // 1. Tìm role cần cập nhật
            const role = await Role.findByPk(roleId, { transaction: t });
            if (!role) {
                throw new AppError('Role not found', 404);
            }

            // 2. Kiểm tra quyền sở hữu
            if (role.created_by !== user.id) {
                throw new AppError(
                    'You are not authorized to update this role',
                    403
                );
            }

            // 3. Cập nhật permissions nếu có
            if (permissionIds && permissionIds.length > 0) {
                // Kiểm tra xem các permission có tồn tại không
                const permissions = await Permission.findAll({
                    where: { id: { [Op.in]: permissionIds } },
                    transaction: t
                });
                if (permissions.length !== permissionIds.length) {
                    const missingIds = permissionIds.filter(
                        id => !permissions.some(p => p.id === id)
                    );
                    throw new AppError(
                        `Permissions with IDs ${missingIds.join(
                            ', '
                        )} do not exist`,
                        404
                    );
                }

                // Xóa permissions cũ
                await RolePermission.destroy({
                    where: { role_id: roleId },
                    transaction: t
                });

                // Thêm permissions mới
                const rolePermissionData = permissionIds.map(permissionId => ({
                    role_id: roleId,
                    permission_id: permissionId
                }));
                await RolePermission.bulkCreate(rolePermissionData, {
                    transaction: t
                });
            }

            // 4. Cập nhật name nếu có
            if (name && name !== role.name) {
                role.name = name;
                await role.save({ transaction: t });
            }

            return role; // Trả về instance role đã cập nhật
        });

        return {
            message: 'Role updated successfully',
            role: {
                id: result.id,
                name: result.name
            }
        };
    },

    deleteRole: async (roleId, user) => {
        await sequelize.transaction(async t => {
            // 1. Tìm role cần xóa
            const role = await Role.findByPk(roleId, { transaction: t });
            if (!role) {
                throw new AppError('Role not found', 404);
            }

            // 2. Kiểm tra quyền sở hữu (nếu cần)
            if (role.created_by !== user.id) {
                throw new AppError(
                    'You are not authorized to delete this role',
                    403
                );
            }

            // 3. Xóa role (các bản ghi trong role_has_permissions sẽ tự động xóa nhờ onDelete: 'CASCADE')

            await role.destroy({ transaction: t });
            // 4. Xóa tất cả permissions cũ của role

            //xóa các bản ghi liên quan đên roleId cần xóa ở role_has_permissions
            await RolePermission.destroy({
                where: { role_id: roleId },
                transaction: t
            });
        });

        return { message: 'Role deleted successfully' };
    }
};

module.exports = roleService;
