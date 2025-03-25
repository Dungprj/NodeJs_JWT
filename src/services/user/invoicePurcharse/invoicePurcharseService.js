require('dotenv').config();

const { Op } = require('sequelize');
const InvoicePurchase = require('../../../db/models/invoicePurchase');
const InvoicePurchaseDetail = require('../../../db/models/invoicePurchaseDetail');
const Product = require('../../../db/models/product'); // Giả định bạn có model Product
const AppError = require('../../../utils/appError');

const invoicePurchaseService = {
    // Lấy tất cả hóa đơn nhập hàng của user (200 OK | 404 Not Found)
    getAllInvoicePurchases: async id => {
        const invoicePurchases = await InvoicePurchase.findAll({
            where: { created_by: id },
            include: [
                { model: InvoicePurchaseDetail, as: 'details' } // Bao gồm chi tiết hóa đơn
            ]
        });

        if (!invoicePurchases || invoicePurchases.length === 0) {
            throw new AppError(
                'Danh sách hóa đơn nhập hàng không tìm thấy',
                404
            );
        }

        return invoicePurchases;
    },

    // Lấy hóa đơn nhập hàng theo ID (200 OK | 404 Not Found)
    getInvoicePurchaseById: async (idQuery, id) => {
        const invoicePurchase = await InvoicePurchase.findAll({
            include: [{ model: InvoicePurchaseDetail, as: 'details' }],
            where: {
                created_by: idQuery,
                id: id
            }
        });
        if (!invoicePurchase) {
            throw new AppError('Không tìm thấy hóa đơn nhập hàng', 404);
        }
        return invoicePurchase;
    },

    // Tạo hóa đơn nhập hàng mới (201 Created | 400 Bad Request)
    createInvoicePurchase: async (data, idQuery) => {
        if (
            !data.branchId ||
            !data.products ||
            !data.cashRegisterId ||
            !Array.isArray(data.products) ||
            data.products.length === 0
        ) {
            throw new AppError(
                'Chi nhánh và danh sách sản phẩm là bắt buộc',
                400
            );
        }

        // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
        const transaction = await InvoicePurchase.sequelize.transaction();

        try {
            // Tính tổng tiền hóa đơn và kiểm tra trùng lặp sản phẩm
            // let totalAmount = 0;
            const itemsMap = new Map();
            for (const product of data.products) {
                if (!product.id || !product.quantity) {
                    throw new AppError(
                        'Mỗi sản phẩm phải có ID và số lượng',
                        400
                    );
                }

                // Lấy thông tin sản phẩm từ bảng Products để lấy giá
                const productInfo = await Product.findByPk(product.id, {
                    transaction
                });
                if (!productInfo) {
                    throw new AppError(
                        `Sản phẩm với ID ${product.id} không tồn tại`,
                        404
                    );
                }

                // const totalPrice = parseFloat(product.quantity) * price;

                const key = product.id;
                if (itemsMap.has(key)) {
                    const existingItem = itemsMap.get(key);
                    existingItem.quantity += parseFloat(product.quantity);
                } else {
                    itemsMap.set(key, {
                        product_id: product.id,
                        price: productInfo.purchase_price || 0,
                        quantity: parseFloat(product.quantity),
                        tax_id: productInfo.tax_id,
                        tax: productInfo.tax || 0

                        // total_price: totalPrice
                    });
                }
                // totalAmount += totalPrice + tax;
            }

            // Tạo mã hóa đơn
            //

            const lastInvoice = await InvoicePurchase.findOne({
                where: {
                    created_by: idQuery
                },
                order: [['id', 'DESC']],
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            // Tính số thứ tự (sequence)
            const sequence = lastInvoice
                ? parseInt(lastInvoice.invoice_id) + 1
                : 1;
            const invoiceId = sequence; // Định dạng số thứ tự với 3 chữ số (001, 002, ...)

            // Tạo hóa đơn nhập hàng
            const newInvoicePurchase = await InvoicePurchase.create(
                {
                    invoice_id: invoiceId,
                    vendor_id: data.vendor_id || 0, // Giả định vendor_id mặc định là 0 vì form không cung cấp
                    branch_id: data.branchId,
                    cash_register_id: data.cashRegisterId || 0,
                    status: 0, // Giả định trạng thái mặc định
                    created_by: idQuery
                },
                { transaction }
            );

            // Tạo chi tiết hóa đơn
            const invoiceDetails = Array.from(itemsMap.values()).map(item => ({
                purchase_id: newInvoicePurchase.id,
                product_id: item.product_id,
                price: item.price,
                quantity: item.quantity,
                tax_id: item.tax_id,
                tax: item.tax
            }));
            await InvoicePurchaseDetail.bulkCreate(invoiceDetails, {
                transaction
            });

            // Cập nhật tồn kho trực tiếp trong bảng Products
            for (const item of itemsMap.values()) {
                const product = await Product.findOne({
                    where: { id: item.product_id },
                    transaction,
                    lock: transaction.LOCK.UPDATE
                });
                if (!product) {
                    throw new AppError(
                        `Sản phẩm với ID ${item.product_id} không tồn tại`,
                        404
                    );
                }
                // Cộng số lượng vào quantity của sản phẩm
                product.quantity =
                    (product.quantity || 0) + parseFloat(item.quantity);
                await product.save({ transaction });
            }

            // Commit transaction
            await transaction.commit();
            return newInvoicePurchase;
        } catch (error) {
            // Rollback transaction nếu có lỗi
            await transaction.rollback();
            throw error;
        }
    },

    // Cập nhật hóa đơn nhập hàng (200 OK | 404 Not Found | 400 Bad Request)
    updateInvoicePurchase: async (id, data, idQuery) => {
        const invoicePurchase = await InvoicePurchase.findOne({
            where: {
                id: id,
                created_by: idQuery
            }
        });
        if (!invoicePurchase) {
            throw new AppError(
                'Không tìm thấy hóa đơn nhập hàng để cập nhật',
                404
            );
        }

        // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
        const transaction = await InvoicePurchase.sequelize.transaction();

        try {
            // Cập nhật các trường được phép
            if (data.branchId) invoicePurchase.branch_id = data.branchId;
            if (data.registerId !== undefined)
                invoicePurchase.cash_register_id = data.registerId;
            if (data.vendor_id !== undefined)
                invoicePurchase.vendor_id = data.vendor_id;
            if (data.status !== undefined) invoicePurchase.status = data.status;

            // Nếu có danh sách sản phẩm mới, cập nhật chi tiết hóa đơn
            if (
                data.products &&
                Array.isArray(data.products) &&
                data.products.length > 0
            ) {
                // Lấy danh sách chi tiết hiện tại
                const currentDetails = await InvoicePurchaseDetail.findAll({
                    where: { purchase_id: id },
                    transaction
                });

                // Trừ tồn kho của các chi tiết hiện tại
                for (const detail of currentDetails) {
                    const product = await Product.findOne({
                        where: { id: detail.product_id },
                        transaction,
                        lock: transaction.LOCK.UPDATE
                    });
                    if (product) {
                        product.quantity -= parseFloat(detail.quantity);
                        if (product.quantity < 0) {
                            throw new AppError(
                                'Số lượng tồn kho không đủ để cập nhật hóa đơn',
                                400
                            );
                        }
                        await product.save({ transaction });
                    }
                }

                // Xóa các chi tiết hiện tại
                await InvoicePurchaseDetail.destroy({
                    where: { purchase_id: id },
                    transaction
                });

                // Kiểm tra trùng lặp sản phẩm và tạo itemsMap
                const itemsMap = new Map();
                for (const product of data.products) {
                    if (!product.id || !product.quantity) {
                        throw new AppError(
                            'Mỗi sản phẩm phải có ID và số lượng',
                            400
                        );
                    }

                    // Lấy thông tin sản phẩm từ bảng Products để lấy giá
                    const productInfo = await Product.findByPk(product.id, {
                        transaction
                    });
                    if (!productInfo) {
                        throw new AppError(
                            `Sản phẩm với ID ${product.id} không tồn tại`,
                            404
                        );
                    }

                    const key = product.id;
                    if (itemsMap.has(key)) {
                        const existingItem = itemsMap.get(key);
                        existingItem.quantity += parseFloat(product.quantity);
                    } else {
                        itemsMap.set(key, {
                            product_id: product.id,
                            price: productInfo.purchase_price || 0,
                            quantity: parseFloat(product.quantity),
                            tax_id: productInfo.tax_id || 0, // Đồng bộ với createInvoicePurchase
                            tax: productInfo.tax || 0 // Đồng bộ với createInvoicePurchase
                        });
                    }
                }

                // Tạo chi tiết hóa đơn mới
                const invoiceDetails = Array.from(itemsMap.values()).map(
                    item => ({
                        purchase_id: invoicePurchase.id,
                        product_id: item.product_id,
                        price: item.price,
                        quantity: item.quantity,
                        tax_id: item.tax_id,
                        tax: item.tax
                    })
                );
                await InvoicePurchaseDetail.bulkCreate(invoiceDetails, {
                    transaction
                });

                // Cập nhật tồn kho với danh sách mới
                for (const item of itemsMap.values()) {
                    const product = await Product.findOne({
                        where: { id: item.product_id },
                        transaction,
                        lock: transaction.LOCK.UPDATE
                    });
                    if (!product) {
                        throw new AppError(
                            `Sản phẩm với ID ${item.product_id} không tồn tại`,
                            404
                        );
                    }
                    // Cộng số lượng vào quantity của sản phẩm
                    product.quantity =
                        (product.quantity || 0) + parseFloat(item.quantity);
                    await product.save({ transaction });
                }
            }

            await invoicePurchase.save({ transaction });

            // Commit transaction
            await transaction.commit();
            return invoicePurchase;
        } catch (error) {
            // Rollback transaction nếu có lỗi
            await transaction.rollback();
            throw error;
        }
    },

    // Xóa hóa đơn nhập hàng (204 No Content | 404 Not Found)
    deleteInvoicePurchase: async (id, idQuery) => {
        const invoicePurchase = await InvoicePurchase.findByPk(id);
        if (!invoicePurchase) {
            throw new AppError('Không tìm thấy hóa đơn nhập hàng để xóa', 404);
        }

        // Kiểm tra quyền truy cập
        if (invoicePurchase.created_by !== idQuery) {
            throw new AppError('Bạn không có quyền xóa hóa đơn này', 403);
        }

        // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
        const transaction = await InvoicePurchase.sequelize.transaction();

        try {
            // Lấy danh sách chi tiết hóa đơn
            const details = await InvoicePurchaseDetail.findAll({
                where: { purchase_id: id },
                transaction
            });

            // Cập nhật tồn kho trực tiếp trong bảng Products
            for (const detail of details) {
                const product = await Product.findOne({
                    where: { id: detail.product_id },
                    transaction,
                    lock: transaction.LOCK.UPDATE
                });
                if (product) {
                    product.quantity -= parseFloat(detail.quantity);
                    if (product.quantity < 0) {
                        throw new AppError(
                            'Số lượng tồn kho không đủ để xóa hóa đơn',
                            400
                        );
                    }
                    await product.save({ transaction });
                }
            }

            // Xóa chi tiết hóa đơn
            await InvoicePurchaseDetail.destroy({
                where: { purchase_id: id },
                transaction
            });

            // Xóa hóa đơn
            await invoicePurchase.destroy({ transaction });

            // Commit transaction
            await transaction.commit();
            return true;
        } catch (error) {
            // Rollback transaction nếu có lỗi
            await transaction.rollback();
            throw error;
        }
    }
};

module.exports = invoicePurchaseService;
