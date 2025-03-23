require('dotenv').config();
const Branch = require('../../../db/models/branch');
const User = require('../../../db/models/user');

const AppError = require('../../../utils/appError');

const branchService = {
    getInitBranch: async user => {
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
                parent_id: user.id
            }
        });

        return {
            branchType,
            userManagerBranch
        };
    },
    // Lấy tất cả chi nhánh của user (200 OK | 404 Not Found)
    getAllBranches: async user => {
        const branches = await Branch.findAll({
            where: { created_by: user.id }
        });

        if (!branches) {
            throw new AppError('Danh sách chi nhánh không tồn tại', 404);
        }

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
    createBranch: async (data, user) => {
        if (!data.name) {
            throw new AppError('Tên chi nhánh là bắt buộc', 400);
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
            created_by: user.id,
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

        if (data.name) branch.name = data.name;
        if (
            data.branch_type &&
            ['Retail', 'Restaurant'].includes(data.branch_type)
        ) {
            branch.branch_type = data.branch_type;
        }
        if (data.branch_manager !== undefined)
            branch.branch_manager = data.branch_manager;
        if (data.image !== undefined) branch.image = data.image;

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
