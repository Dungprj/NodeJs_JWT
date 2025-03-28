require('dotenv').config();
const { Op } = require('sequelize');
const InvoicePurchase = require('../../../db/models/invoicePurchase');
const InvoicePurchaseDetail = require('../../../db/models/invoicePurchaseDetail');
const Product = require('../../../db/models/product');

const Vendor = require('../../../db/models/vendor');
const CashRegister = require('../../../db/models/cashregister');
const Branch = require('../../../db/models/branch');

const AppError = require('../../../utils/appError');
const Tax = require('../../../db/models/tax');

const invoicePurchaseService = {
    // Lấy tất cả hóa đơn nhập hàng của user (200 OK | 404 Not Found)
    getAllInvoicePurchases: async id => {
        const invoicePurchases = await InvoicePurchase.findAll({
            where: { created_by: id },
            include: [
                {
                    model: InvoicePurchaseDetail,
                    as: 'details'
                },
                {
                    model: Vendor,
                    as: 'vendor'
                },
                {
                    model: CashRegister,
                    as: 'cashRegister'
                },
                {
                    model: Branch,
                    as: 'branch'
                }
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
            include: [
                {
                    model: InvoicePurchaseDetail,
                    as: 'details'
                },
                {
                    model: Vendor,
                    as: 'vendor'
                },
                {
                    model: CashRegister,
                    as: 'cashRegister'
                },
                {
                    model: Branch,
                    as: 'branch'
                }
            ],
            where: { created_by: idQuery, id: id }
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

        const transaction = await InvoicePurchase.sequelize.transaction();
        try {
            const itemsMap = new Map();
            const productIds = data.products.map(p => p.id);

            const products = await Product.findAll({
                include: {
                    model: Tax,
                    as: 'tax'
                },
                where: { id: { [Op.in]: productIds } },
                transaction
            });

            console.log('du lieu : ', products);

            for (const product of data.products) {
                const productInfo = products.find(
                    p => p.dataValues.id === product.id
                );
                if (!productInfo) {
                    throw new AppError(
                        `Sản phẩm với ID ${product.id} không tồn tại`,
                        404
                    );
                }
                if (!product.id || !product.quantity) {
                    throw new AppError(
                        'Mỗi sản phẩm phải có ID và số lượng',
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
                        price: productInfo.purchase_price || 0,
                        quantity: parseFloat(product.quantity),
                        tax_id: productInfo.tax_id || 0,
                        tax: productInfo.tax.percentage || 0
                    });
                }
            }

            const lastInvoice = await InvoicePurchase.findOne({
                where: { created_by: idQuery },
                order: [['id', 'DESC']],
                transaction
            });
            const sequence = lastInvoice
                ? parseInt(lastInvoice.invoice_id) + 1
                : 1;
            const invoiceId = sequence;

            const newInvoicePurchase = await InvoicePurchase.create(
                {
                    invoice_id: invoiceId,
                    vendor_id: data.vendor_id || 0,
                    branch_id: data.branchId,
                    cash_register_id: data.cashRegisterId || 0,
                    status: data.status ?? 2,
                    created_by: idQuery
                },
                { transaction }
            );

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

            // Cập nhật tồn kho nguyên tử
            for (const item of itemsMap.values()) {
                const updatedRows = await Product.update(
                    {
                        quantity: Product.sequelize.literal(
                            `quantity + ${parseFloat(item.quantity)}`
                        )
                    },
                    {
                        where: { id: item.product_id },
                        transaction,
                        lock: transaction.LOCK.UPDATE
                    }
                );
                if (updatedRows[0] === 0) {
                    throw new AppError(
                        `Không thể cập nhật tồn kho cho sản phẩm ${item.product_id}`,
                        500
                    );
                }
            }

            await transaction.commit();
            return newInvoicePurchase;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    // Cập nhật hóa đơn nhập hàng (200 OK | 404 Not Found | 400 Bad Request)
    updateInvoicePurchase: async (id, data, idQuery) => {
        const invoicePurchase = await InvoicePurchase.findOne({
            where: { id: id, created_by: idQuery }
        });
        if (!invoicePurchase) {
            throw new AppError(
                'Không tìm thấy hóa đơn nhập hàng để cập nhật',
                404
            );
        }

        const transaction = await InvoicePurchase.sequelize.transaction();
        try {
            if (data.branchId) invoicePurchase.branch_id = data.branchId;
            if (data.cashRegisterId !== undefined)
                invoicePurchase.cash_register_id = data.cashRegisterId;
            if (data.vendor_id !== undefined)
                invoicePurchase.vendor_id = data.vendor_id;
            if (data.status !== undefined) invoicePurchase.status = data.status;
            if (data.tax !== undefined) invoicePurchase.tax = data.tax;

            if (
                data.products &&
                Array.isArray(data.products) &&
                data.products.length > 0
            ) {
                const currentDetails = await InvoicePurchaseDetail.findAll({
                    where: { purchase_id: id },
                    transaction
                });

                // Hoàn lại tồn kho với LOCK.UPDATE
                for (const detail of currentDetails) {
                    const updatedRows = await Product.update(
                        {
                            quantity: Product.sequelize.literal(
                                `quantity - ${parseFloat(detail.quantity)}`
                            )
                        },
                        {
                            where: {
                                id: detail.product_id,
                                quantity: {
                                    [Op.gte]: parseFloat(detail.quantity)
                                }
                            },
                            transaction,
                            lock: transaction.LOCK.UPDATE
                        }
                    );
                    if (updatedRows[0] === 0) {
                        throw new AppError(
                            `Số lượng tồn kho không đủ để hoàn lại cho sản phẩm ${detail.product_id}`,
                            400
                        );
                    }
                }

                await InvoicePurchaseDetail.destroy({
                    where: { purchase_id: id },
                    transaction
                });

                const itemsMap = new Map();
                for (const product of data.products) {
                    if (!product.id || !product.quantity) {
                        throw new AppError(
                            'Mỗi sản phẩm phải có ID và số lượng',
                            400
                        );
                    }

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
                            tax_id: productInfo.tax_id || 0,
                            tax: productInfo.tax || 0
                        });
                    }
                }

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

                // Cập nhật tồn kho mới với LOCK.UPDATE
                for (const item of itemsMap.values()) {
                    const updatedRows = await Product.update(
                        {
                            quantity: Product.sequelize.literal(
                                `quantity + ${parseFloat(item.quantity)}`
                            )
                        },
                        {
                            where: { id: item.product_id },
                            transaction,
                            lock: transaction.LOCK.UPDATE
                        }
                    );
                    if (updatedRows[0] === 0) {
                        throw new AppError(
                            `Không thể cập nhật tồn kho cho sản phẩm ${item.product_id}`,
                            500
                        );
                    }
                }
            }

            await invoicePurchase.save({ transaction });
            await transaction.commit();
            return invoicePurchase;
        } catch (error) {
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
        if (invoicePurchase.created_by !== idQuery) {
            throw new AppError('Bạn không có quyền xóa hóa đơn này', 403);
        }

        const transaction = await InvoicePurchase.sequelize.transaction();
        try {
            const details = await InvoicePurchaseDetail.findAll({
                where: { purchase_id: id },
                transaction
            });

            // Giảm tồn kho với LOCK.UPDATE
            for (const detail of details) {
                const updatedRows = await Product.update(
                    {
                        quantity: Product.sequelize.literal(
                            `quantity - ${parseFloat(detail.quantity)}`
                        )
                    },
                    {
                        where: {
                            id: detail.product_id,
                            quantity: { [Op.gte]: parseFloat(detail.quantity) }
                        },
                        transaction,
                        lock: transaction.LOCK.UPDATE
                    }
                );
                if (updatedRows[0] === 0) {
                    throw new AppError(
                        `Số lượng tồn kho không đủ để xóa sản phẩm ${detail.product_id}`,
                        400
                    );
                }
            }

            await InvoicePurchaseDetail.destroy({
                where: { purchase_id: id },
                transaction
            });
            await invoicePurchase.destroy({ transaction });
            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};

module.exports = invoicePurchaseService;
