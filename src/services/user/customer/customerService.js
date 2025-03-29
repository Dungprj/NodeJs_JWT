require('dotenv').config();
const Customer = require('../../../db/models/customer');
const AppError = require('../../../utils/appError');
const { Op } = require('sequelize');
const redisClient = require('../../../config/redis'); // Import từ file cấu hình
const customerService = {
    // Lấy tất cả khách hàng của user (200 OK | 404 Not Found)
    getAllCustomers: async idQuery => {
        const customers = await Customer.findAll({
            where: { created_by: idQuery }
        });

        if (!customers || customers.length === 0) {
            throw new AppError('Danh sách khách hàng không tồn tại', 404);
        }

        return customers;
    },

    // Lấy thông tin khách hàng theo ID (200 OK | 404 Not Found)
    getCustomerById: async (id, idQuery) => {
        const customer = await Customer.findOne({
            where: { id, created_by: idQuery }
        });
        if (!customer) {
            throw new AppError('Không tìm thấy khách hàng', 404);
        }
        return customer;
    },

    // Tạo khách hàng mới (201 Created | 400 Bad Request)
    createCustomer: async (data, idQuery) => {
        const transaction = await Customer.sequelize.transaction();
        try {
            // Kiểm tra các trường bắt buộc
            if (!data.name || !data.email || !data.phone_number) {
                throw new AppError(
                    'Tên, email và số điện thoại là bắt buộc',
                    400
                );
            }

            // Kiểm tra email đã tồn tại
            const existingCustomer = await Customer.findOne({
                where: {
                    email: data.email,
                    created_by: idQuery
                }
            });

            if (existingCustomer) {
                throw new AppError('Email đã tồn tại', 409);
            }

            // Tạo khách hàng mới
            const newCustomer = await Customer.create(
                {
                    name: data.name,
                    email: data.email,
                    phone_number: data.phone_number,
                    address: data.address || null,
                    city: data.city || null,
                    state: data.state || null,
                    country: data.country || null,
                    zipcode: data.zipcode || null,
                    is_active:
                        data.is_active !== undefined ? data.is_active : 0,
                    created_by: idQuery
                },
                { transaction }
            );
            await transaction.commit();
            return newCustomer;
        } catch (error) {
            const redisKey = `customer_count:${idQuery}`;
            const currentCount = await redisClient.get(redisKey);
            if (currentCount > 0) {
                await redisClient.decr(redisKey);
            }

            console.log('Loi phai giam --- ', await redisClient.get(redisKey));

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

    // Cập nhật khách hàng (200 OK | 404 Not Found | 400 Bad Request)
    updateCustomer: async (id, data, idQuery) => {
        const transaction = await Customer.sequelize.transaction();
        try {
            const customer = await Customer.findOne({
                where: {
                    id: id,
                    created_by: idQuery
                }
            });

            //check trung customer
            const existingCustomer = await Customer.findOne({
                where: {
                    email: data.email,
                    created_by: idQuery,
                    id: { [Op.ne]: id } // Không tính chính khách hàng đang cập nhật
                }
            });
            if (existingCustomer) {
                throw new AppError('Email đã tồn tại', 409);
            }

            if (!customer) {
                throw new AppError(
                    'Không tìm thấy khách hàng để cập nhật',
                    404
                );
            }

            // Kiểm tra email nếu được cập nhật
            if (data.email && data.email !== customer.email) {
                const existingCustomer = await Customer.findOne({
                    where: {
                        email: data.email,
                        created_by: idQuery,
                        id: { [Op.ne]: id } // Không tính chính khách hàng đang cập nhật
                    }
                });
                if (existingCustomer) {
                    throw new AppError('Email đã tồn tại', 409);
                }
                customer.email = data.email;
            }

            // Cập nhật các trường được phép
            if (data.name) customer.name = data.name;
            if (data.phone_number) customer.phone_number = data.phone_number;
            if (data.address !== undefined) customer.address = data.address;
            if (data.city !== undefined) customer.city = data.city;
            if (data.state !== undefined) customer.state = data.state;
            if (data.country !== undefined) customer.country = data.country;
            if (data.zipcode !== undefined) customer.zipcode = data.zipcode;
            if (data.is_active !== undefined)
                customer.is_active = data.is_active;

            await customer.save({ transaction });
            // Commit transaction nếu thành công
            await transaction.commit();
            return customer;
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

    // Xóa khách hàng (204 No Content | 404 Not Found)
    deleteCustomer: async (id, idQuery) => {
        const transaction = await Customer.sequelize.transaction();
        const redisKey = `customer_count:${idQuery}`;
        try {
            const newCount = await redisClient.decr(redisKey);
            if (newCount < 0) {
                await redisClient.incr(redisKey);
                return next(
                    new AppError('Lỗi trong việc giảm số lượng trên redis', 400)
                );
            }
            const customer = await Customer.findOne({
                where: {
                    id: id,
                    created_by: idQuery
                }
            });
            if (!customer) {
                throw new AppError('Không tìm thấy khách hàng để xóa', 404);
            }

            await customer.destroy({ transaction });
            // Commit transaction nếu thành công
            await transaction.commit();
            return true;
        } catch (error) {
            //tăng lại số lượng khi lỗi
            await redisClient.incr(redisKey);

            console.log('Loi phai tang --- ', await redisClient.get(redisKey));
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

module.exports = customerService;
