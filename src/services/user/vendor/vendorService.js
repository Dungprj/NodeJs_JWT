require('dotenv').config();
const redisClient = require('../../../config/redis'); // Import từ file cấu hình
const Vendor = require('../../../db/models/vendor');
const AppError = require('../../../utils/appError');

const vendorService = {
    // Lấy tất cả nhà cung cấp của user (200 OK | 404 Not Found)
    getAllVendors: async idQuery => {
        const vendors = await Vendor.findAll({
            where: { created_by: idQuery }
        });

        if (!vendors || vendors.length === 0) {
            throw new AppError('Danh sách nhà cung cấp không tìm thấy', 404);
        }

        return vendors;
    },

    // Lấy nhà cung cấp theo ID (200 OK | 404 Not Found)
    getVendorById: async (id, idQuery) => {
        const vendor = await Vendor.findOne({
            where: {
                id,
                created_by: idQuery
            }
        });
        if (!vendor) {
            throw new AppError('Không tìm thấy nhà cung cấp', 404);
        }
        return vendor;
    },

    // Tạo nhà cung cấp mới (201 Created | 400 Bad Request)
    createVendor: async (data, idQuery) => {
        const transaction = await Vendor.sequelize.transaction();
        try {
            //lay goi hien tai
            // lay so nha cung cap max
            if (!data.name || !data.email || !data.phone_number) {
                throw new AppError(
                    'Tên, email và số điện thoại là bắt buộc',
                    400
                );
            }

            const vendorExist = await Vendor.findOne({
                where: {
                    created_by: idQuery,
                    email: data.email
                }
            });

            if (vendorExist) {
                throw new AppError('Email nhà cung cấp đã tồn tại', 400);
            }

            // Hàm tạo slug từ name
            const generateSlug = str => {
                str = str.toLowerCase();
                str = str.replace(/\s+/g, '-');
                str = str.replace(/[^a-zA-Z0-9\u00C0-\u017F\-]+/g, '');
                str = str.replace(/\-\-+/g, '-').trim();
                return str;
            };

            const newVendor = await Vendor.create(
                {
                    name: data.name,
                    slug: generateSlug(data.name),
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
                {
                    transaction
                }
            );
            await transaction.commit();
            return newVendor;
        } catch (error) {
            // Nếu lỗi, giảm đếm trong Redis để giữ đồng bộ
            const redisKey = `vendor_count:${idQuery}`;
            const currentCount = await redisClient.get(redisKey);
            if (currentCount > 0) {
                await redisClient.decr(redisKey);

                console.log(
                    'Loi phai giam --- ',
                    await redisClient.get(redisKey)
                );
            }
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

    // Cập nhật nhà cung cấp (200 OK | 404 Not Found | 400 Bad Request)
    updateVendor: async (id, idQuery, data) => {
        const transaction = await Vendor.sequelize.transaction();
        try {
            const vendor = await Vendor.findOne({
                where: {
                    id,
                    created_by: idQuery
                },
                transaction: transaction
            });
            if (!vendor) {
                throw new AppError(
                    'Không tìm thấy nhà cung cấp để cập nhật',
                    404
                );
            }

            if (data.email) {
                const isExistVendorName = await Vendor.findOne({
                    where: {
                        email: data.email,
                        created_by: idQuery,
                        id: { [Op.ne]: id } // Loại bỏ danh mục hiện tại khỏi kết quả
                    },
                    transaction: transaction
                });

                if (isExistVendorName) {
                    throw new AppError('Tên Vendor đã tồn tại', 409);
                }
                vendor.email = data.email;
            }
            if (data.name) vendor.name = data.name;
            if (data.phone_number) vendor.phone_number = data.phone_number;
            if (data.address !== undefined) vendor.address = data.address;
            if (data.city !== undefined) vendor.city = data.city;
            if (data.state !== undefined) vendor.state = data.state;
            if (data.country !== undefined) vendor.country = data.country;
            if (data.zipcode !== undefined) vendor.zipcode = data.zipcode;
            if (data.is_active !== undefined) vendor.is_active = data.is_active;

            await vendor.save({ transaction });
            await transaction.commit();
            return vendor;
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

    // Xóa nhà cung cấp (204 No Content | 404 Not Found)
    deleteVendor: async (id, idQuery) => {
        const transaction = await Vendor.sequelize.transaction();
        const redisKey = `vendor_count:${idQuery}`;
        try {
            const newCount = await redisClient.decr(redisKey);

            if (newCount < 0) {
                await redisClient.incr(redisKey);
                return next(
                    new AppError('Lỗi trong việc giảm số lượng trên redis', 400)
                );
            }

            const vendor = await Vendor.findByPk(id);
            if (!vendor) {
                throw new AppError('Không tìm thấy nhà cung cấp để xóa', 404);
            }

            await vendor.destroy({ transaction });
            await transaction.commit();
            return true;
        } catch (error) {
            // Nếu lỗi, tăng đếm trong Redis để giữ đồng bộ
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

module.exports = vendorService;
