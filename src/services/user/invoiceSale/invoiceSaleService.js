require('dotenv').config();

const { Op } = require('sequelize');
const InvoiceSale = require('../../../db/models/invoicesale');
const InvoiceSaleDetail = require('../../../db/models/invoicesaledetail');
const Product = require('../../../db/models/product');
const AppError = require('../../../utils/appError');

const invoiceSaleService = {
    // Lấy tất cả hóa đơn bán hàng của user (200 OK | 404 Not Found)
    getAllInvoiceSales: async user => {
        const invoiceSales = await InvoiceSale.findAll({
            where: { created_by: user.id },
            include: [
                { model: InvoiceSaleDetail, as: 'details' } // Bao gồm chi tiết hóa đơn
            ]
        });

        if (!invoiceSales || invoiceSales.length === 0) {
            throw new AppError(
                'Danh sách hóa đơn bán hàng không tìm thấy',
                404
            );
        }

        return invoiceSales;
    },

    // Lấy hóa đơn bán hàng theo ID (200 OK | 404 Not Found)
    getInvoiceSaleById: async (user, id) => {
        const invoiceSale = await InvoiceSale.findAll({
            include: [{ model: InvoiceSaleDetail, as: 'details' }],
            where: {
                created_by: user.id,
                id: id
            }
        });
        if (!invoiceSale) {
            throw new AppError('Không tìm thấy hóa đơn bán hàng', 404);
        }
        return invoiceSale;
    },

    // Tạo hóa đơn bán hàng mới (201 Created | 400 Bad Request)
    createInvoiceSale: async (data, user) => {
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
        const transaction = await InvoiceSale.sequelize.transaction();

        try {
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

                // Kiểm tra số lượng tồn kho
                if (productInfo.quantity < parseFloat(product.quantity)) {
                    throw new AppError(
                        `Số lượng tồn kho không đủ cho sản phẩm ${productInfo.name}`,
                        400
                    );
                }

                const key = product.id;
                if (itemsMap.has(key)) {
                    const existingItem = itemsMap.get(key);
                    existingItem.quantity += parseFloat(product.quantity);
                } else {
                    itemsMap.set(key, {
                        product_id: product.id,
                        price: productInfo.sale_price || 0, // Giả định có cột sale_price trong Product
                        quantity: parseFloat(product.quantity),
                        tax_id: productInfo.tax_id || 0,
                        tax: productInfo.tax || 0
                    });
                }
            }

            // Tạo mã hóa đơn
            const lastInvoice = await InvoiceSale.findOne({
                where: { created_by: user.id },
                order: [['id', 'DESC']],
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            // Tính số thứ tự (sequence)
            const sequence = lastInvoice
                ? parseInt(lastInvoice.invoice_id) + 1
                : 1;
            const invoiceId = sequence; // Định dạng số thứ tự với 3 chữ số (001, 002, ...)

            // Tạo hóa đơn bán hàng
            const newInvoiceSale = await InvoiceSale.create(
                {
                    invoice_id: invoiceId,
                    customer_id: data.customerId || 0, // Khách hàng có thể không có
                    branch_id: data.branchId,
                    cash_register_id: data.cashRegisterId,
                    status: 0, // Giả định trạng thái mặc định
                    created_by: user.id
                },
                { transaction }
            );

            // Tạo chi tiết hóa đơn
            const invoiceDetails = Array.from(itemsMap.values()).map(item => ({
                sell_id: newInvoiceSale.id,
                product_id: item.product_id,
                price: item.price,
                quantity: item.quantity,
                tax_id: item.tax_id,
                tax: item.tax
            }));
            await InvoiceSaleDetail.bulkCreate(invoiceDetails, { transaction });

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
                // Giảm số lượng trong quantity của sản phẩm
                product.quantity =
                    (product.quantity || 0) - parseFloat(item.quantity);
                if (product.quantity < 0) {
                    throw new AppError(
                        `Số lượng tồn kho không đủ cho sản phẩm ${product.name}`,
                        400
                    );
                }
                await product.save({ transaction });
            }

            // Commit transaction
            await transaction.commit();
            return newInvoiceSale;
        } catch (error) {
            // Rollback transaction nếu có lỗi
            await transaction.rollback();
            throw error;
        }
    },

    // Cập nhật hóa đơn bán hàng (200 OK | 404 Not Found | 400 Bad Request)
    updateInvoiceSale: async (id, data, user) => {
        const invoiceSale = await InvoiceSale.findOne({
            where: {
                id: id,
                created_by: user.id
            }
        });
        if (!invoiceSale) {
            throw new AppError(
                'Không tìm thấy hóa đơn bán hàng để cập nhật',
                404
            );
        }

        // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
        const transaction = await InvoiceSale.sequelize.transaction();

        try {
            // Cập nhật các trường được phép
            if (data.branchId) invoiceSale.branch_id = data.branchId;
            if (data.cashRegisterId !== undefined)
                invoiceSale.cash_register_id = data.cashRegisterId;
            if (data.customerId !== undefined)
                invoiceSale.customer_id = data.customerId;
            if (data.status !== undefined) invoiceSale.status = data.status;

            // Nếu có danh sách sản phẩm mới, cập nhật chi tiết hóa đơn
            if (
                data.products &&
                Array.isArray(data.products) &&
                data.products.length > 0
            ) {
                // Lấy danh sách chi tiết hiện tại
                const currentDetails = await InvoiceSaleDetail.findAll({
                    where: { sell_id: id },
                    transaction
                });

                // Hoàn lại tồn kho của các chi tiết hiện tại
                for (const detail of currentDetails) {
                    const product = await Product.findOne({
                        where: { id: detail.product_id },
                        transaction,
                        lock: transaction.LOCK.UPDATE
                    });
                    if (product) {
                        product.quantity += parseFloat(detail.quantity); // Hoàn lại số lượng
                        await product.save({ transaction });
                    }
                }

                // Xóa các chi tiết hiện tại
                await InvoiceSaleDetail.destroy({
                    where: { sell_id: id },
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

                    // Kiểm tra số lượng tồn kho
                    if (productInfo.quantity < parseFloat(product.quantity)) {
                        throw new AppError(
                            `Số lượng tồn kho không đủ cho sản phẩm ${productInfo.name}`,
                            400
                        );
                    }

                    const key = product.id;
                    if (itemsMap.has(key)) {
                        const existingItem = itemsMap.get(key);
                        existingItem.quantity += parseFloat(product.quantity);
                    } else {
                        itemsMap.set(key, {
                            product_id: product.id,
                            price: productInfo.sale_price || 0,
                            quantity: parseFloat(product.quantity),
                            tax_id: productInfo.tax_id || 0,
                            tax: productInfo.tax || 0
                        });
                    }
                }

                // Tạo chi tiết hóa đơn mới
                const invoiceDetails = Array.from(itemsMap.values()).map(
                    item => ({
                        sell_id: invoiceSale.id,
                        product_id: item.product_id,
                        price: item.price,
                        quantity: item.quantity,
                        tax_id: item.tax_id,
                        tax: item.tax
                    })
                );
                await InvoiceSaleDetail.bulkCreate(invoiceDetails, {
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
                    // Giảm số lượng trong quantity của sản phẩm
                    product.quantity =
                        (product.quantity || 0) - parseFloat(item.quantity);
                    if (product.quantity < 0) {
                        throw new AppError(
                            `Số lượng tồn kho không đủ cho sản phẩm ${product.name}`,
                            400
                        );
                    }
                    await product.save({ transaction });
                }
            }

            await invoiceSale.save({ transaction });

            // Commit transaction
            await transaction.commit();
            return invoiceSale;
        } catch (error) {
            // Rollback transaction nếu có lỗi
            await transaction.rollback();
            throw error;
        }
    },

    // Xóa hóa đơn bán hàng (204 No Content | 404 Not Found)
    deleteInvoiceSale: async (id, user) => {
        const invoiceSale = await InvoiceSale.findByPk(id);
        if (!invoiceSale) {
            throw new AppError('Không tìm thấy hóa đơn bán hàng để xóa', 404);
        }

        // Kiểm tra quyền truy cập
        if (invoiceSale.created_by !== user.id) {
            throw new AppError('Bạn không có quyền xóa hóa đơn này', 403);
        }

        // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
        const transaction = await InvoiceSale.sequelize.transaction();

        try {
            // Lấy danh sách chi tiết hóa đơn
            const details = await InvoiceSaleDetail.findAll({
                where: { sell_id: id },
                transaction
            });

            // Hoàn lại tồn kho
            for (const detail of details) {
                const product = await Product.findOne({
                    where: { id: detail.product_id },
                    transaction,
                    lock: transaction.LOCK.UPDATE
                });
                if (product) {
                    product.quantity += parseFloat(detail.quantity); // Hoàn lại số lượng
                    await product.save({ transaction });
                }
            }

            // Xóa chi tiết hóa đơn
            await InvoiceSaleDetail.destroy({
                where: { sell_id: id },
                transaction
            });

            // Xóa hóa đơn
            await invoiceSale.destroy({ transaction });

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

module.exports = invoiceSaleService;
