require('dotenv').config();
const Permission = require('../../../db/models/permissions');
const Role = require('../../../db/models/roles');
const RolePermission = require('../../../db/models/rolepermissions');

const AppError = require('../../../utils/appError');

const permissionService = {
    getListPermission: async user => {
        //get permissions by  roleName
        const permissions = await Promise.all([
            Permission.findAll({
                attributes: ['id', 'name'],
                include: [
                    {
                        model: Role,
                        attributes: [],
                        as: 'Permission_roles',
                        where: {
                            name: user.type
                        },

                        through: {
                            model: RolePermission,
                            attributes: [],
                            as: 'Permission_roles'
                        }
                    }
                ],
                raw: true
            })
        ]);

        if (!permissions) {
            throw new AppError('List permission not found');
        }

        return permissions;
    }
};

module.exports = permissionService;
