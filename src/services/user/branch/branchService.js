require('dotenv').config();
const Branch = require('../../../db/models/branch');
const CastRegister = require('../../../db/models/cashregister');
const User = require('../../../db/models/user');

const AppError = require('../../../utils/appError');
const commom = require('../../../common/common');
const branchService = {
    // parent_id

    getInitBranch: async id => {
        const branchType = [
            {
                name: 'Retail'
            },
            {
                name: 'Restaurant'
            }
        ];

        const userManagerBranch = await User.findAll({
            where: {
                parent_id: id
            }
        });

        return {
            branchType,
            userManagerBranch
        };
    },
    // Lấy tất cả chi nhánh của user (200 OK | 404 Not Found)
    getAllBranches: async id => {
        const branches = await Branch.findAll({
            include: [
                {
                    model: CastRegister,
                    as: 'branchCashRegister'
                },
                {
                    model: User,
                    as: 'BranchUser'
                }
            ],
            where: { created_by: id }
        });

        return branches;
    },

    // Lấy thông tin chi nhánh theo ID (200 OK | 404 Not Found)
    getBranchById: async id => {
        const branch = await Branch.findByPk(id);
        if (!branch) {
            throw new AppError('Không tìm thấy chi nhánh', 404);
        }
        return branch;
    },

    // Tạo chi nhánh mới (201 Created | 400 Bad Request)
    createBranch: async (data, id) => {
        if (!data.name) {
            throw new AppError('Tên chi nhánh là bắt buộc', 400);
        }
        // Kiểm tra xem tên chi nhánh đã tồn tại chưa
        const existingBranch = await Branch.findOne({
            where: { name: data.name }
        });

        if (existingBranch) {
            throw new AppError('Branch with this name already exists.', 409); // Ném lỗi nếu đã tồn tại
        }

        // Kiểm tra branch_type nếu được cung cấp
        if (
            data.branch_type &&
            !['Retail', 'Restaurant'].includes(data.branch_type)
        ) {
            throw new AppError(
                'Loại chi nhánh phải là Retail hoặc Restaurant',
                400
            );
        }

        const newBranch = await Branch.create({
            name: data.name,
            branch_type: data.branch_type || null,
            branch_manager: data.branch_manager || 0,
            created_by: id,
            image: data.image || null
        });

        return newBranch;
    },

    // Cập nhật chi nhánh (200 OK | 404 Not Found)
    updateBranch: async (id, data) => {
        const branch = await Branch.findByPk(id);
        if (!branch) {
            throw new AppError('Không tìm thấy chi nhánh để cập nhật', 404);
        }

        const existingBranch = await Branch.findOne({
            where: { name: data.name }
        });

        if (existingBranch) {
            throw new AppError('chi nhánh đã tồn tại', 409);
        }

        if (
            data.branch_type &&
            ['Retail', 'Restaurant'].includes(data.branch_type)
        ) {
            branch.branch_type = data.branch_type;
        }
        if (data.branch_manager !== undefined)
            branch.branch_manager = data.branch_manager;

        await branch.save();
        return branch;
    },

    // Xóa chi nhánh (204 No Content | 404 Not Found)
    deleteBranch: async id => {
        const branch = await Branch.findByPk(id);
        if (!branch) {
            throw new AppError('Không tìm thấy chi nhánh để xóa', 404);
        }

        await branch.destroy();
        return true;
    }
};

module.exports = branchService;
