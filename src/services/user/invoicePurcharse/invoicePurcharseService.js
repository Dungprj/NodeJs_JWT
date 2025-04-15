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
const User = require('../../../db/models/user');
const commom = require('../../../common/common');

const invoicePurchaseService = {
    // Lấy tất cả hóa đơn nhập hàng của user (200 OK | 404 Not Found)
    getAllInvoicePurchases: async idQuery => {
        // Lấy danh sách id nhân viên
        const danhSachNhanVien = await User.findAll({
            where: {
                parent_id: idQuery
            }
        });

        const invoicePurchases = await InvoicePurchase.findAll({
            where: {
                created_by: {
                    [Op.in]: [idQuery, ...danhSachNhanVien.map(nv => nv.id)]
                }
            },
            include: [
                {
                    model: InvoicePurchaseDetail,
                    as: 'details',
                    include: {
                        model: Product,
                        as: 'product',
                        attributes: ['id', 'name']
                    }
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'address']
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
        // Lấy danh sách id nhân viên
        const danhSachNhanVien = await User.findAll({
            where: {
                parent_id: idQuery
            }
        });
        const invoicePurchase = await InvoicePurchase.findAll({
            include: [
                {
                    model: InvoicePurchaseDetail,
                    as: 'details',
                    include: {
                        model: Product,
                        as: 'product',
                        attributes: ['id', 'name']
                    }
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'address']
                },
                {
                    model: Vendor,
                    as: 'vendor',
                    attributes: ['id', 'name']
                },
                {
                    model: CashRegister,
                    as: 'cashRegister',
                    attributes: ['id', 'name']
                },
                {
                    model: Branch,
                    as: 'branch',
                    attributes: ['id', 'name']
                }
            ],
            where: {
                created_by: {
                    [Op.in]: [idQuery, ...danhSachNhanVien.map(nv => nv.id)]
                },
                id: id
            }
        });
        if (!invoicePurchase) {
            throw new AppError('Không tìm thấy hóa đơn nhập hàng', 404);
        }
        return invoicePurchase;
    },

    generateQRCode: async (idQuery, id) => {
        const danhSachNhanVien = await User.findAll({
            where: {
                parent_id: idQuery
            }
        });
        const invoicePurchase = await InvoicePurchase.findAll({
            include: [
                {
                    model: InvoicePurchaseDetail,
                    as: 'details',
                    include: {
                        model: Product,
                        as: 'product',
                        attributes: ['id', 'name']
                    }
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'address']
                },
                {
                    model: Vendor,
                    as: 'vendor',
                    attributes: ['id', 'name']
                },
                {
                    model: CashRegister,
                    as: 'cashRegister',
                    attributes: ['id', 'name']
                },
                {
                    model: Branch,
                    as: 'branch',
                    attributes: ['id', 'name']
                }
            ],
            raw: true,
            where: {
                created_by: {
                    [Op.in]: [idQuery, ...danhSachNhanVien.map(nv => nv.id)]
                },
                id: id
            }
        });
        if (!invoicePurchase) {
            throw new AppError('Không tìm thấy hóa đơn nhập hàng', 404);
        }

        const invoice = invoicePurchase.map(invoice => {
            return {
                id: invoice.id,
                created_at: invoice.created_at,
                invoiceTo: invoice['user.name'],
                invoiceFrom: invoice['vendor.name'],
                product: {
                    id: invoice['details.price'],
                    name: invoice['details.product.name'],
                    price: invoice['details.price'],
                    quantity: invoice['details.quantity'],
                    tax: invoice['details.tax']
                }
            };
        });

        console.log('invoice detail :', invoice);

        let sumTotal = 0;

        const listItems = invoice.map(item => {
            const taxCalc =
                item.product.price *
                item.product.quantity *
                (item.product.tax / 100);

            const totalCalc =
                item.product.price * item.product.quantity + taxCalc;

            sumTotal += totalCalc;
            return {
                name: item.product.name || 'unknow',
                quantity: item.product.quantity || 0,
                price: commom.formatCurrency(item.product.price) || 0,
                tax: `${item.product.tax}%` || 0,
                taxAmount: commom.formatCurrency(taxCalc) || 0,
                total: commom.formatCurrency(totalCalc) || 0
            };
        });

        const dataPrepare = {
            invoiceNumber: `PUR${invoice[0].id}` || 'unknow',
            date: invoice[0].created_at || 'unknow',
            invoiceTo: invoice[0].invoiceTo || 'unknow',
            invoiceFrom: invoice[0].invoiceFrom || 'unknow',
            items: listItems || [],
            total: commom.formatCurrency(sumTotal) || 0
        };

        console.log('dữ liệu chuẩn bị : ', dataPrepare);

        const testUrl = commom.generateInvoiceUrl(dataPrepare);

        return testUrl;
    },

    // Tạo hóa đơn nhập hàng mới (201 Created | 400 Bad Request)
    createInvoicePurchase: async (data, idQuery, idUserCurrent) => {
        if (data.branchId == undefined) {
            throw new AppError('Chi nhánh là bắt buộc', 400);
        }

        if (data.products == undefined) {
            throw new AppError('Danh sách sản phẩm là bắt buộc', 400);
        }

        if (data.cashRegisterId == undefined) {
            throw new AppError('Cash register ID là bắt buộc', 400);
        }

        if (data.paied == undefined) {
            throw new AppError('Trạng thái đã thanh toán là bắt buộc', 400);
        }

        if (!Array.isArray(data.products)) {
            throw new AppError('Danh sách sản phẩm phải là một mảng', 400);
        }

        if (data.products.length === 0) {
            throw new AppError('Danh sách sản phẩm không được để trống', 400);
        }

        const danhSachNhanVien = await User.findAll({
            where: {
                parent_id: idQuery
            }
        });

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
                        tax: productInfo.tax?.percentage || 0
                    });
                }
            }

            const lastInvoice = await InvoicePurchase.findOne({
                where: {
                    created_by: {
                        [Op.in]: [idQuery, ...danhSachNhanVien.map(nv => nv.id)]
                    }
                },
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
                    paied: data.paied || 0,
                    // created_by: idQuery
                    created_by: idUserCurrent
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

            const hoaDonChiTiet =
                await invoicePurchaseService.getInvoicePurchaseById(
                    idQuery,
                    newInvoicePurchase.id
                );
            return hoaDonChiTiet;
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

    // Cập nhật hóa đơn nhập hàng (200 OK | 404 Not Found | 400 Bad Request)
    updateInvoicePurchase: async (id, data, idQuery) => {
        const danhSachNhanVien = await User.findAll({
            where: {
                parent_id: idQuery
            }
        });
        const invoicePurchase = await InvoicePurchase.findOne({
            where: {
                id: id,
                created_by: {
                    [Op.in]: [idQuery, ...danhSachNhanVien.map(nv => nv.id)]
                }
            }
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
            if (data.paied !== undefined) invoicePurchase.paied = data.paied;

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

    // Xóa hóa đơn nhập hàng (204 No Content | 404 Not Found)
    deleteInvoicePurchase: async (id, idQuery) => {
        const danhSachNhanVien = await User.findAll({
            where: {
                parent_id: idQuery
            }
        });
        const invoicePurchase = await InvoicePurchase.findOne({
            where: {
                id: id,
                created_by: {
                    [Op.in]: [idQuery, ...danhSachNhanVien.map(nv => nv.id)]
                }
            }
        });
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

module.exports = invoicePurchaseService;
