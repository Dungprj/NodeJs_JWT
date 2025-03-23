require('dotenv').config();

const { Op } = require('sequelize');
const InvoicePurchase = require('../../../db/models/invoicePurchase');
const InvoicePurchaseDetail = require('../../../db/models/invoicePurchaseDetail');
const Inventory = require('../../../db/models/inventory'); // Giả định bạn có model Inventory
const Product = require('../../../db/models/product'); // Giả định bạn có model Product
const AppError = require('../../../utils/appError');

const invoicePurchaseService = {
    // Lấy tất cả hóa đơn nhập hàng của user (200 OK | 404 Not Found)
    getAllInvoicePurchases: async user => {
        const invoicePurchases = await InvoicePurchase.findAll({
            where: { created_by: user.id },
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
    getInvoicePurchaseById: async id => {
        const invoicePurchase = await InvoicePurchase.findByPk(id, {
            include: [{ model: InvoicePurchaseDetail, as: 'details' }]
        });
        if (!invoicePurchase) {
            throw new AppError('Không tìm thấy hóa đơn nhập hàng', 404);
        }
        return invoicePurchase;
    },

    // Tạo hóa đơn nhập hàng mới (201 Created | 400 Bad Request)
    createInvoicePurchase: async (data, user) => {
        if (
            !data.brandId ||
            !data.products ||
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
            let totalAmount = 0;
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

                const price = productInfo.price || 0; // Giả định bảng Products có cột price
                const tax = 0; // Giả định không có thuế, bạn có thể thêm logic tính thuế nếu cần
                const totalPrice = parseFloat(product.quantity) * price;

                const key = product.id;
                if (itemsMap.has(key)) {
                    const existingItem = itemsMap.get(key);
                    existingItem.quantity += parseFloat(product.quantity);
                    existingItem.total_price = existingItem.quantity * price;
                } else {
                    itemsMap.set(key, {
                        product_id: product.id,
                        quantity: parseFloat(product.quantity),
                        price: price,
                        tax: tax,
                        total_price: totalPrice
                    });
                }
                totalAmount += totalPrice + tax;
            }

            // Tạo mã hóa đơn (PINV-<created_by>-XXX)
            const prefix = `PINV-${user.id}-`;
            const lastInvoice = await InvoicePurchase.findOne({
                where: {
                    created_by: user.id,
                    invoice_id: { [Op.like]: `${prefix}%` }
                },
                order: [['id', 'DESC']],
                transaction,
                lock: transaction.LOCK.ADD
            });

            // Tính số thứ tự (sequence)
            const sequence = lastInvoice
                ? parseInt(lastInvoice.invoice_id.split('-')[2]) + 1
                : 1;
            const invoiceId = `${prefix}${String(sequence).padStart(3, '0')}`; // Định dạng số thứ tự với 3 chữ số (001, 002, ...)

            // Tạo hóa đơn nhập hàng
            const newInvoicePurchase = await InvoicePurchase.create(
                {
                    invoice_id: invoiceId,
                    vendor_id: 0, // Giả định vendor_id mặc định là 0 vì form không cung cấp
                    branch_id: data.brandId,
                    cash_register_id: data.cashRegisterId || 0,
                    status: 0, // Giả định trạng thái mặc định
                    created_by: user.id,
                    total_amount: totalAmount
                },
                { transaction }
            );

            // Tạo chi tiết hóa đơn
            const invoiceDetails = Array.from(itemsMap.values()).map(item => ({
                purchase_id: newInvoicePurchase.id,
                product_id: item.product_id,
                price: item.price,
                quantity: item.quantity,
                tax_id: 0, // Giả định không có thuế
                tax: item.tax
            }));
            await InvoicePurchaseDetail.bulkCreate(invoiceDetails, {
                transaction
            });

            // Cập nhật tồn kho
            for (const item of itemsMap.values()) {
                const inventory = await Inventory.findOne({
                    where: { product_id: item.product_id },
                    transaction,
                    lock: transaction.LOCK.UPDATE
                });
                if (inventory) {
                    inventory.quantity += parseFloat(item.quantity);
                    await inventory.save({ transaction });
                } else {
                    await Inventory.create(
                        {
                            product_id: item.product_id,
                            quantity: item.quantity
                        },
                        { transaction }
                    );
                }
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
    updateInvoicePurchase: async (id, data, user) => {
        const invoicePurchase = await InvoicePurchase.findByPk(id);
        if (!invoicePurchase) {
            throw new AppError(
                'Không tìm thấy hóa đơn nhập hàng để cập nhật',
                404
            );
        }

        // Kiểm tra quyền truy cập
        if (invoicePurchase.created_by !== user.id) {
            throw new AppError('Bạn không có quyền cập nhật hóa đơn này', 403);
        }

        // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
        const transaction = await InvoicePurchase.sequelize.transaction();

        try {
            // Cập nhật các trường được phép
            if (data.brandId) invoicePurchase.branch_id = data.brandId;
            if (data.cashRegisterId !== undefined)
                invoicePurchase.cash_register_id = data.cashRegisterId;
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
                    const inventory = await Inventory.findOne({
                        where: { product_id: detail.product_id },
                        transaction,
                        lock: transaction.LOCK.UPDATE
                    });
                    if (inventory) {
                        inventory.quantity -= parseFloat(detail.quantity);
                        if (inventory.quantity < 0) {
                            throw new AppError(
                                'Số lượng tồn kho không đủ để cập nhật hóa đơn',
                                400
                            );
                        }
                        await inventory.save({ transaction });
                    }
                }

                // Xóa các chi tiết hiện tại
                await InvoicePurchaseDetail.destroy({
                    where: { purchase_id: id },
                    transaction
                });

                // Tính tổng tiền mới và kiểm tra trùng lặp sản phẩm
                let totalAmount = 0;
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

                    const price = productInfo.price || 0;
                    const tax = 0; // Giả định không có thuế
                    const totalPrice = parseFloat(product.quantity) * price;

                    const key = product.id;
                    if (itemsMap.has(key)) {
                        const existingItem = itemsMap.get(key);
                        existingItem.quantity += parseFloat(product.quantity);
                        existingItem.total_price =
                            existingItem.quantity * price;
                    } else {
                        itemsMap.set(key, {
                            product_id: product.id,
                            quantity: parseFloat(product.quantity),
                            price: price,
                            tax: tax,
                            total_price: totalPrice
                        });
                    }
                    totalAmount += totalPrice + tax;
                }

                // Tạo chi tiết hóa đơn mới
                const invoiceDetails = Array.from(itemsMap.values()).map(
                    item => ({
                        purchase_id: invoicePurchase.id,
                        product_id: item.product_id,
                        price: item.price,
                        quantity: item.quantity,
                        tax_id: 0,
                        tax: item.tax
                    })
                );
                await InvoicePurchaseDetail.bulkCreate(invoiceDetails, {
                    transaction
                });

                // Cập nhật tồn kho với danh sách mới
                for (const item of itemsMap.values()) {
                    const inventory = await Inventory.findOne({
                        where: { product_id: item.product_id },
                        transaction,
                        lock: transaction.LOCK.UPDATE
                    });
                    if (inventory) {
                        inventory.quantity += parseFloat(item.quantity);
                        await inventory.save({ transaction });
                    } else {
                        await Inventory.create(
                            {
                                product_id: item.product_id,
                                quantity: item.quantity
                            },
                            { transaction }
                        );
                    }
                }

                // Cập nhật tổng tiền hóa đơn
                invoicePurchase.total_amount = totalAmount;
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
    deleteInvoicePurchase: async (id, user) => {
        const invoicePurchase = await InvoicePurchase.findByPk(id);
        if (!invoicePurchase) {
            throw new AppError('Không tìm thấy hóa đơn nhập hàng để xóa', 404);
        }

        // Kiểm tra quyền truy cập
        if (invoicePurchase.created_by !== user.id) {
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

            // Cập nhật tồn kho
            for (const detail of details) {
                const inventory = await Inventory.findOne({
                    where: { product_id: detail.product_id },
                    transaction,
                    lock: transaction.LOCK.UPDATE
                });
                if (inventory) {
                    inventory.quantity -= parseFloat(detail.quantity);
                    if (inventory.quantity < 0) {
                        throw new AppError(
                            'Số lượng tồn kho không đủ để xóa hóa đơn',
                            400
                        );
                    }
                    await inventory.save({ transaction });
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
