require('dotenv').config();
const Branch = require('../../../db/models/branch');
const CastRegister = require('../../../db/models/cashregister');
const User = require('../../../db/models/user');
const { Op } = require('sequelize');
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

        if (!branches) {
            throw new AppError('Danh sách chi nhánh không tồn tại', 404);
        }

        return branches;
    },

    // Lấy thông tin chi nhánh theo ID (200 OK | 404 Not Found)
    getBranchById: async (id, idQuery) => {
        const branch = await Branch.findOne({
            where: { id: id, created_by: idQuery }
        });
        if (!branch) {
            throw new AppError('Không tìm thấy chi nhánh', 404);
        }
        return branch;
    },

    // Tạo chi nhánh mới (201 Created | 400 Bad Request)
    createBranch: async (data, idQuery) => {
        const transaction = await Branch.sequelize.transaction();
        try {
            if (!data.name) {
                throw new AppError('Tên chi nhánh là bắt buộc', 400);
            }
            // Kiểm tra xem tên chi nhánh đã tồn tại chưa
            const existingBranch = await Branch.findOne({
                where: { name: data.name, created_by: idQuery }
            });

            if (existingBranch) {
                throw new AppError('Tên chi nhánh đã tồn tại', 409); // Ném lỗi nếu đã tồn tại
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

            const newBranch = await Branch.create(
                {
                    name: data.name,
                    branch_type: data.branch_type || null,
                    branch_manager: data.branch_manager || 0,
                    created_by: idQuery,
                    image: data.image || null
                },
                { transaction }
            );
            // Commit transaction nếu thành công
            await transaction.commit();
            return newBranch;
        } catch (error) {
            // Rollback transaction nếu có lỗi
            await transaction.rollback();

            // Đảm bảo lỗi gốc được ném lại với mã trạng thái đúng
            if (error instanceof AppError) {
                throw error; // Giữ nguyên lỗi với mã trạng thái ban đầu (400, 409, v.v.)
            }
            // Nếu là lỗi không mong muốn, ném lỗi 500
            throw new AppError(error, 500);
        }
    },

    // Cập nhật chi nhánh (200 OK | 404 Not Found)
    updateBranch: async (id, idQuery, data) => {
        const transaction = await Branch.sequelize.transaction();
        try {
            const branch = await Branch.findByPk(id);
            if (!branch) {
                throw new AppError('Không tìm thấy chi nhánh để cập nhật', 404);
            }

            const existingBranchName = await Branch.findOne({
                where: {
                    name: data.name,
                    id: { [Op.ne]: id },
                    created_by: idQuery
                }
            });

            if (existingBranchName) {
                throw new AppError('Tên chi nhánh đã tồn tại', 409);
            }

            if (
                data.branch_type &&
                ['Retail', 'Restaurant'].includes(data.branch_type)
            ) {
                branch.branch_type = data.branch_type;
            }
            if (data.branch_manager !== undefined)
                branch.branch_manager = data.branch_manager;

            if (data.name !== undefined) branch.name = data.name;

            await branch.save({ transaction });
            await transaction.commit();
            return branch;
        } catch (error) {
            // Rollback transaction nếu có lỗi
            await transaction.rollback();

            // Đảm bảo lỗi gốc được ném lại với mã trạng thái đúng
            if (error instanceof AppError) {
                throw error; // Giữ nguyên lỗi với mã trạng thái ban đầu (400, 409, v.v.)
            }
            // Nếu là lỗi không mong muốn, ném lỗi 500
            throw new AppError(error, 500);
        }
    },

    // Xóa chi nhánh (204 No Content | 404 Not Found)
    deleteBranch: async (id, idQuery) => {
        const transaction = await Branch.sequelize.transaction();
        try {
            const branch = await Branch.findOne({
                where: { id: id, created_by: idQuery }
            });
            if (!branch) {
                throw new AppError('Không tìm thấy chi nhánh để xóa', 404);
            }

            await branch.destroy({ transaction });
            await transaction.commit();
            return true;
        } catch (error) {
            // Rollback transaction nếu có lỗi
            await transaction.rollback();

            // Đảm bảo lỗi gốc được ném lại với mã trạng thái đúng
            if (error instanceof AppError) {
                throw error; // Giữ nguyên lỗi với mã trạng thái ban đầu (400, 409, v.v.)
            }
            // Nếu là lỗi không mong muốn, ném lỗi 500
            throw new AppError(error, 500);
        }
    }
};

module.exports = branchService;
