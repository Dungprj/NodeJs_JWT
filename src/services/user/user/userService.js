require('dotenv').config();

const User = require('../../../db/models/user');
const Role = require('../../../db/models/roles');
const Branch = require('../../../db/models/branch');
const CastRegister = require('../../../db/models/cashregister');
const redisClient = require('../../../config/redis'); // Import từ file cấu hình
const AppError = require('../../../utils/appError');
const { Op } = require('sequelize');
const planService = require('../plan/planService');
const userService = {
    getListUser: async idQuery => {
        const users = await User.findAll({
            attributes: {
                exclude: ['password', 'confirmPassword', 'deletedAt']
            },
            where: {
                parent_id: idQuery
            }
        });

        if (!users) {
            throw new AppError('List User not found', 404);
        }

        return users;
    },

    getListUserPhanTrang: async (idQuery, page = 1, limit = 10) => {
        const offset = (page - 1) * limit; // Tính offset dựa trên trang hiện tại
        const { count, rows } = await User.findAndCountAll({
            attributes: {
                exclude: ['password', 'confirmPassword', 'deletedAt']
            },
            limit: limit, // Số bản ghi mỗi trang
            offset: offset, // Bỏ qua số bản ghi trước đó
            where: {
                parent_id: idQuery
            }
        });

        // Tính tổng số trang
        const totalPages = Math.ceil(count / limit);

        if (count <= 0) {
            throw new AppError('List User not found', 404);
        }

        return {
            totalItems: count, // Tổng số bản ghi
            totalPages: totalPages, // Tổng số trang
            currentPage: page, // Trang hiện tại
            users: rows // Dữ liệu người dùng
        };
    },

    getUserById: async (id, idQuery) => {
        const user = await User.findOne({
            attributes: {
                exclude: ['password', 'confirmPassword', 'deletedAt']
            }, // Exclude sensitive fields
            where: {
                id: id,
                parent_id: idQuery
            }
        });
        if (!user) {
            throw new AppError('User not found', 404);
        }

        return user;
    },
    AddUserInit: async idQuery => {
        //get danh sach vai tro cua user dang dang nhap

        const roleList = await Role.findAll({
            attributes: ['id', 'name'],
            where: {
                created_by: idQuery
            }
        });
        //get danh sach chi nhanh user dang dang nhap
        const branchList = await Branch.findAll({
            attributes: ['id', 'name'],
            include: {
                model: CastRegister,
                as: 'branchCashRegister'
            },
            where: {
                created_by: idQuery
            }
        });

        return {
            roleList,
            branchList
        };
    },
    handleActiveUser: async (id, idQuery, data) => {
        const transaction = await User.sequelize.transaction();

        try {
            const user = await User.findOne({
                where: {
                    id,
                    parent_id: idQuery
                }
            });
            if (!user) {
                throw new AppError(
                    'Không tìm thấy user để xử lý trạng thái',
                    404
                );
            }

            if (data.status == null) {
                throw new AppError('Trạng thái chưa hợp lệ', 400);
            }

            user.is_active = data.status;

            await user.save({ transaction });
            await transaction.commit();
            return user;
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
    addUser: async (idQuery, data) => {
        const useCurrent = await User.findByPk(idQuery);

        const getplanCurrentByIdQuery = await planService.getDateExpire(
            idQuery
        );

        if (!useCurrent) {
            throw new AppError('User not found', 404);
        }

        if (!useCurrent) {
            throw new AppError('User not found', 404);
        }

        const transaction = await User.sequelize.transaction();
        try {
            const {
                name,
                email,
                password,
                confirmPassword,
                address = '',
                email_verified_at = null,
                avatar = null,
                parent_id = idQuery,
                type,
                branch_id,
                cash_register_id,
                lang = 'vi',
                mode = 'light',
                plan_id = getplanCurrentByIdQuery.planCurrent.id,
                plan_expire_date = getplanCurrentByIdQuery.expirePlan,
                plan_requests = 0,
                is_active = 0,
                user_status = 0,
                remember_token = null,
                created_at = null,
                updated_at = null,
                last_login_at = null
            } = data;

            //kiem tra co ton tai khong
            const isExistUser = await User.findOne({
                where: {
                    email: email,
                    parent_id: idQuery
                },
                transaction: transaction
            });

            if (isExistUser) {
                throw new AppError('Email already exists', 409);
            }

            const newUser = await User.create(
                {
                    name: name,
                    email: email,
                    password: password,
                    confirmPassword: confirmPassword,
                    address: address,
                    email_verified_at: email_verified_at,
                    avatar: avatar,
                    parent_id: parent_id,
                    type: type,
                    branch_id: branch_id,
                    cash_register_id: cash_register_id,
                    lang: lang,
                    mode: mode,
                    plan_id: plan_id,
                    plan_expire_date: plan_expire_date,
                    plan_requests: plan_requests,
                    is_active: is_active,
                    user_status: user_status,
                    remember_token: remember_token,
                    created_at: created_at,
                    updated_at: updated_at,
                    last_login_at: last_login_at
                },
                { transaction }
            );

            if (!newUser) {
                return new AppError('Failed to create this user', 400);
            }

            const result = newUser.toJSON();
            delete result.password;
            delete result.confirmPassword;
            delete result.deletedAt;
            // Trả về response
            await transaction.commit();
            return result;
        } catch (error) {
            // Rollback transaction nếu có lỗi
            await transaction.rollback();
            // Nếu lỗi, giảm đếm trong Redis để giữ đồng bộ
            const redisKey = `sub_user_count:${idQuery}`;
            const currentCount = await redisClient.get(redisKey);
            if (currentCount > 0) {
                await redisClient.decr(redisKey);
            }

            console.log('Loi phai giam --- ', await redisClient.get(redisKey));

            // Đảm bảo lỗi gốc được ném lại với mã trạng thái đúng
            if (error instanceof AppError) {
                throw error; // Giữ nguyên lỗi với mã trạng thái ban đầu (400, 409, v.v.)
            }
            // Nếu là lỗi không mong muốn, ném lỗi 500
            throw new AppError(error, 500);
        }
    },

    updateUser: async (id, idQuery, data) => {
        const transaction = await User.sequelize.transaction();
        try {
            // Tìm user theo id
            const user = await User.findByPk(id);
            if (!user) {
                throw new AppError('Không tìm thấy user để cập nhật', 404);
            }

            // Destructuring dữ liệu từ data với giá trị mặc định
            const {
                name,
                email,
                password,
                confirmPassword,
                address,
                email_verified_at = null,
                avatar = null,
                type,
                branch_id,
                cash_register_id,
                lang,
                mode,
                plan_id,
                plan_expire_date = null,
                plan_requests,
                is_active,
                user_status,
                remember_token,
                created_at,
                updated_at,
                last_login_at
            } = data;

            // Kiểm tra email nếu có thay đổi (không trùng với email khác)
            if (email) {
                const isExistUser = await User.findOne({
                    where: {
                        email: email,
                        parent_id: idQuery,
                        id: { [Op.ne]: id } // Loại bỏ danh mục hiện tại khỏi kết quả
                    },
                    transaction: transaction
                });
                if (isExistUser) {
                    throw new AppError('Email đã tồn tại', 409);
                }
            }

            // Cập nhật các trường của user
            await user.update(
                {
                    name: name || user.name, // Giữ giá trị cũ nếu không cung cấp
                    email: email || user.email,
                    password: password || user.password, // Nên mã hóa nếu thay đổi password
                    confirmPassword: confirmPassword || user.confirmPassword,
                    address: address,
                    email_verified_at: email_verified_at,
                    avatar: avatar,
                    type: type || user.type,
                    branch_id: branch_id || user.branch_id,
                    cash_register_id: cash_register_id || user.cash_register_id,
                    lang: lang,
                    mode: mode,
                    plan_id: plan_id,
                    plan_expire_date: plan_expire_date,
                    plan_requests: plan_requests,
                    is_active: is_active,
                    user_status: user_status,
                    remember_token: remember_token,
                    created_at: created_at || user.created_at,
                    updated_at: updated_at || new Date(), // Cập nhật thời gian mới
                    last_login_at: last_login_at || user.last_login_at
                },
                {
                    transaction
                }
            );

            // Chuyển đổi sang JSON và xóa các trường nhạy cảm
            const result = user.toJSON();
            delete result.password;
            delete result.confirmPassword;
            delete result.deletedAt;
            await transaction.commit();
            return result;
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
    setAgainPassword: async (id, idQuery, data) => {
        const transaction = await User.sequelize.transaction();
        try {
            const user = await User.findOne({
                where: {
                    id,
                    parent_id: idQuery
                },
                transaction: transaction
            });
            if (!user) {
                throw new AppError(
                    'Không tìm thấy user để thay đổi mật khẩu',
                    404
                );
            }

            const { password, confirmPassword } = data;

            if (password !== confirmPassword) {
                throw new AppError('Mật khẩu nhập lại không trùng khớp', 400);
            }
            await user.update(
                {
                    password: password,
                    confirmPassword: confirmPassword
                },
                { transaction }
            );
            await transaction.commit();
            return user;
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

module.exports = userService;
