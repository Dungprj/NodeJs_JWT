require('dotenv').config();
const { Op } = require('sequelize');
const ProductReturn = require('../../../db/models/productreturn');
const AppError = require('../../../utils/appError');

const productReturnService = {
    // Lấy tất cả phiếu trả hàng của user (200 OK | 404 Not Found)
    getAllProductReturns: async idQuery => {
        const productReturns = await ProductReturn.findAll({
            where: { created_by: idQuery }
        });

        if (!productReturns || productReturns.length === 0) {
            throw new AppError('Danh sách phiếu trả hàng không tồn tại', 404);
        }

        return productReturns;
    },

    // Lấy thông tin phiếu trả hàng theo ID (200 OK | 404 Not Found)
    getProductReturnById: async (id, idQuery) => {
        const productReturn = await ProductReturn.findOne({
            where: {
                id: id,
                created_by: idQuery
            }
        });
        if (!productReturn) {
            throw new AppError('Không tìm thấy phiếu trả hàng', 404);
        }
        return productReturn;
    },

    // Tạo phiếu trả hàng mới (201 Created | 400 Bad Request)
    createProductReturn: async (data, idQuery) => {
        // Kiểm tra các trường bắt buộc
        if (!data.date || !data.reference_no) {
            throw new AppError('Ngày và mã tham chiếu là bắt buộc', 400);
        }

        // Kiểm tra reference_no đã tồn tại
        const existingProductReturn = await ProductReturn.findOne({
            where: {
                reference_no: data.reference_no,
                created_by: idQuery
            }
        });

        if (existingProductReturn) {
            throw new AppError('Mã tham chiếu đã tồn tại', 409);
        }

        // Tạo phiếu trả hàng mới
        const newProductReturn = await ProductReturn.create({
            date: data.date,
            reference_no: data.reference_no,
            vendor_id: data.vendor_id || 0,
            customer_id: data.customer_id || 0,
            return_note: data.return_note || null,
            staff_note: data.staff_note || null,
            created_by: idQuery
        });

        return newProductReturn;
    },

    // Cập nhật phiếu trả hàng (200 OK | 404 Not Found | 400 Bad Request)
    updateProductReturn: async (id, data, idQuery) => {
        const transaction = await ProductReturn.sequelize.transaction();
        try {
            const productReturn = await ProductReturn.findOne({
                where: {
                    id: id,
                    created_by: idQuery
                }
            });
            if (!productReturn) {
                throw new AppError(
                    'Không tìm thấy phiếu trả hàng để cập nhật',
                    404
                );
            }

            // Kiểm tra reference_no nếu được cập nhật
            if (
                data.reference_no &&
                data.reference_no !== productReturn.reference_no
            ) {
                const existingProductReturn = await ProductReturn.findOne({
                    where: {
                        reference_no: data.reference_no,
                        created_by: idQuery,
                        id: { [Op.ne]: id } // Không tính chính phiếu trả hàng đang cập nhật
                    }
                });
                if (existingProductReturn) {
                    throw new AppError('Mã tham chiếu đã tồn tại', 409);
                }
                productReturn.reference_no = data.reference_no;
            }

            // Cập nhật các trường được phép
            if (data.date) productReturn.date = data.date;
            if (data.vendor_id !== undefined)
                productReturn.vendor_id = data.vendor_id;
            if (data.customer_id !== undefined)
                productReturn.customer_id = data.customer_id;
            if (data.return_note !== undefined)
                productReturn.return_note = data.return_note;
            if (data.staff_note !== undefined)
                productReturn.staff_note = data.staff_note;

            await productReturn.save({
                transaction
            });
            await transaction.commit();
            return productReturn;
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

    // Xóa phiếu trả hàng (204 No Content | 404 Not Found)
    deleteProductReturn: async (id, idQuery) => {
        const transaction = await ProductReturn.sequelize.transaction();
        try {
            const productReturn = await ProductReturn.findOne({
                where: {
                    id: id,
                    created_by: idQuery
                }
            });
            if (!productReturn) {
                throw new AppError('Không tìm thấy phiếu trả hàng để xóa', 404);
            }

            await productReturn.destroy({ transaction });
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

module.exports = productReturnService;
