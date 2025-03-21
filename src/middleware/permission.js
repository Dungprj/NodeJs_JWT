const User = require('../db/models/user');
const Token = require('../db/models/token');
const RolePermission = require('../db/models/rolepermissions');
const Role = require('../db/models/roles');
const Permission = require('../db/models/permissions');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const { Op } = require('sequelize');
// Middleware kiểm tra permission trực tiếp từ database
const checkPermission = requiredPermission => {
    return catchAsync(async (req, res, next) => {
        // Lấy role và permissions từ database
        const permissions = await Permission.findAll({
            attributes: ['name'],
            include: [
                {
                    model: Role,
                    attributes: [],
                    as: 'Permission_roles',
                    where: {
                        name: req.type
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

        const permissionArr = permissions.map(per => per.name);
        // Kiểm tra quyền
        if (!permissionArr.includes(requiredPermission)) {
            return next(
                new AppError(`Bạn không có quyền ${requiredPermission}!`, 403)
            );
        }

        next();
    });
};

module.exports = checkPermission;
