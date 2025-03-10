const User = require('../db/models/user');
const Token = require('../db/models/token');
const RolePermission = require('../db/models/rolepermissions');
const Role = require('../db/models/roles');
const Permission = require('../db/models/permissions');

const commom = {
    getListPermission: async isExistUser => {
        const permissions = await Promise.all([
            Permission.findAll({
                attributes: ['name'],
                include: [
                    {
                        model: Role,
                        attributes: [],
                        as: 'Permission_roles',
                        through: {
                            model: RolePermission,
                            attributes: [],
                            as: 'Permission_roles'
                        },
                        where: {
                            name: isExistUser.type
                        }
                    }
                ],
                raw: true
            })
        ]);

        return permissions;
    }
};

module.exports = commom;
