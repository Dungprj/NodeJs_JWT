require('dotenv').config();
const { Op } = require('sequelize');
const InvoiceSale = require('../../../db/models/invoicesale');
const InvoiceSaleDetail = require('../../../db/models/invoicesaledetail');
const Product = require('../../../db/models/product');
const Customer = require('../../../db/models/customer');
const Branch = require('../../../db/models/branch');
const Tax = require('../../../db/models/tax');

const CashRegister = require('../../../db/models/cashregister');

const AppError = require('../../../utils/appError');
const User = require('../../../db/models/user');
const commom = require('../../../common/common');

const invoiceSaleService = {
    // Lấy tất cả hóa đơn bán hàng của user (200 OK | 404 Not Found)
    getAllInvoiceSales: async idQuery => {
        const invoiceSales = await InvoiceSale.findAll({
            where: { created_by: idQuery },
            include: [
                {
                    model: InvoiceSaleDetail,
                    as: 'details',
                    include: {
                        model: Product,
                        as: 'product',
                        attributes: ['id', 'name']
                    }
                },

                {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Customer,
                    as: 'Customer',
                    attributes: ['id', 'name']
                },
                {
                    model: Branch,
                    as: 'branch',
                    attributes: ['id', 'name']
                },
                {
                    model: CashRegister,
                    as: 'cashRegister',
                    attributes: ['id', 'name']
                }
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

    generateQRCode: async (idQuery, id) => {
        const invoiceSales = await InvoiceSale.findAll({
            where: { created_by: idQuery, id: id },
            raw: true,
            include: [
                {
                    model: InvoiceSaleDetail,
                    as: 'details',
                    include: {
                        model: Product,
                        as: 'product',
                        attributes: ['id', 'name']
                    }
                },

                {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Customer,
                    as: 'Customer',
                    attributes: ['id', 'name']
                },
                {
                    model: Branch,
                    as: 'branch',
                    attributes: ['id', 'name']
                },
                {
                    model: CashRegister,
                    as: 'cashRegister',
                    attributes: ['id', 'name']
                }
            ]
        });
        if (!invoiceSales) {
            throw new AppError('Không tìm thấy hóa đơn nhập hàng', 404);
        }

        console.log('invoide :', invoiceSales);

        const invoice = invoiceSales.map(invoice => {
            return {
                id: invoice.id,
                created_at: invoice.created_at,
                invoiceTo: invoice['Customer.name'],
                invoiceFrom: invoice['User.name'],
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
                tax: `${item.product.tax}%`,
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
            total: commom.formatCurrency(sumTotal) || 'unknow'
        };

        console.log('dữ liệu chuẩn bị : ', dataPrepare);

        const testUrl = commom.generateInvoiceUrl(dataPrepare);

        return testUrl;
    },

    // Lấy hóa đơn bán hàng theo ID (200 OK | 404 Not Found)
    getInvoiceSaleById: async (idQuery, id) => {
        const invoiceSale = await InvoiceSale.findAll({
            include: [
                {
                    model: InvoiceSaleDetail,
                    as: 'details',
                    include: {
                        model: Product,
                        as: 'product',
                        attributes: ['id', 'name']
                    }
                },
                {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Customer,
                    as: 'Customer',
                    attributes: ['id', 'name']
                },
                {
                    model: Branch,
                    as: 'branch',
                    attributes: ['id', 'name']
                },
                {
                    model: CashRegister,
                    as: 'cashRegister',
                    attributes: ['id', 'name']
                }
            ],
            where: { created_by: idQuery, id: id }
        });
        if (!invoiceSale) {
            throw new AppError('Không tìm thấy hóa đơn bán hàng', 404);
        }
        return invoiceSale;
    },

    // Tạo hóa đơn bán hàng mới (201 Created | 400 Bad Request)

    createInvoiceSale: async (data, idQuery) => {
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
            throw new AppError('paied là bắt buộc', 400);
        }

        if (Array.isArray(data.products) == false) {
            throw new AppError('Danh sách sản phẩm phải là một mảng', 400);
        }

        if (data.products.length === 0) {
            throw new AppError('Danh sách sản phẩm không được để trống', 400);
        }

        const transaction = await InvoiceSale.sequelize.transaction();
        try {
            const itemsMap = new Map();
            const productIds = data.products.map(p => p.id);

            // Khóa sản phẩm ngay từ đầu
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
                        price: productInfo.sale_price || 0,
                        quantity: parseFloat(product.quantity),
                        tax_id: productInfo.tax_id || 0,
                        tax: productInfo.tax?.percentage || 0
                    });
                }
            }

            // Tạo mã hóa đơn
            const lastInvoice = await InvoiceSale.findOne({
                where: { created_by: idQuery },
                order: [['id', 'DESC']],
                transaction
            });
            const sequence = lastInvoice
                ? parseInt(lastInvoice.invoice_id) + 1
                : 1;
            const invoiceId = sequence;

            // Tạo hóa đơn bán hàng
            const newInvoiceSale = await InvoiceSale.create(
                {
                    invoice_id: invoiceId,
                    customer_id: data.customerId || 0,
                    branch_id: data.branchId,
                    cash_register_id: data.cashRegisterId,
                    status: data.status ?? 2,
                    paied: data.paied ?? 0,
                    created_by: idQuery
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

            // Cập nhật tồn kho nguyên tử
            for (const item of itemsMap.values()) {
                const updatedRows = await Product.update(
                    {
                        //literal có thể chứa phép toán logic  , tên cột chứa giá trị cũ của cột đố
                        //trong trường hợp này thì nó sẽ lấy giá trị cũ của sản phẩm để trừ đi số lượng đã mua
                        quantity: Product.sequelize.literal(
                            `quantity - ${parseFloat(item.quantity)}`
                        )
                    },
                    {
                        where: {
                            id: item.product_id,
                            quantity: { [Op.gte]: parseFloat(item.quantity) } // Chỉ cập nhật nếu đủ số lượng
                        },
                        transaction,
                        lock: transaction.LOCK.UPDATE
                    }
                );

                if (updatedRows[0] === 0) {
                    throw new AppError(
                        `Sản phẩm với ID ${item.product_id} đã hết hàng`,
                        400
                    );
                }
            }

            await transaction.commit();
            return newInvoiceSale;
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

    // Cập nhật hóa đơn bán hàng (200 OK | 404 Not Found | 400 Bad Request)
    updateInvoiceSale: async (id, data, idQuery) => {
        const invoiceSale = await InvoiceSale.findOne({
            where: { id: id, created_by: idQuery }
        });
        if (!invoiceSale) {
            throw new AppError(
                'Không tìm thấy hóa đơn bán hàng để cập nhật',
                404
            );
        }

        const transaction = await InvoiceSale.sequelize.transaction();
        try {
            if (data.branchId) invoiceSale.branch_id = data.branchId;
            if (data.cashRegisterId)
                invoiceSale.cash_register_id = data.cashRegisterId;
            if (data.customerId) invoiceSale.customer_id = data.customerId;
            if (data.status) invoiceSale.status = data.status;
            if (data.tax !== undefined) invoiceSale.tax = data.tax;
            if (data.paied !== undefined) invoiceSale.paied = data.paied;

            if (
                data.products &&
                Array.isArray(data.products) &&
                data.products.length > 0
            ) {
                const currentDetails = await InvoiceSaleDetail.findAll({
                    where: { sell_id: id },
                    transaction
                });

                // Hoàn lại tồn kho
                for (const detail of currentDetails) {
                    const updatedRows = await Product.update(
                        {
                            //literal có thể chứa phép toán logic  , tên cột chứa giá trị cũ của cột đố
                            //trong trường hợp này thì nó sẽ lấy giá trị cũ của sản phẩm để trừ đi số lượng đã mua
                            quantity: Product.sequelize.literal(
                                `quantity + ${parseFloat(detail.quantity)}`
                            )
                        },
                        {
                            where: {
                                id: detail.product_id
                            },
                            transaction,
                            lock: transaction.LOCK.UPDATE
                        }
                    );

                    if (updatedRows[0] === 0) {
                        throw new AppError(
                            `Không thể hoàn lại tồn kho cho sản phẩm ${detail.product_id}`,
                            500
                        );
                    }
                }

                await InvoiceSaleDetail.destroy({
                    where: { sell_id: id },
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

                for (const item of itemsMap.values()) {
                    const updatedRows = await Product.update(
                        {
                            //literal có thể chứa phép toán logic  , tên cột chứa giá trị cũ của cột đố
                            //trong trường hợp này thì nó sẽ lấy giá trị cũ của sản phẩm để trừ đi số lượng đã mua
                            quantity: Product.sequelize.literal(
                                `quantity - ${parseFloat(item.quantity)}`
                            )
                        },
                        {
                            where: {
                                id: item.product_id,
                                quantity: {
                                    [Op.gte]: parseFloat(item.quantity)
                                } // Chỉ cập nhật nếu đủ số lượng
                            },
                            transaction,
                            lock: transaction.LOCK.UPDATE
                        }
                    );

                    if (updatedRows[0] === 0) {
                        throw new AppError(
                            `Sản phẩm với ID ${item.product_id} đã hết hàng`,
                            400
                        );
                    }
                }
            }
            await invoiceSale.save({ transaction });
            await transaction.commit();

            return invoiceSale;
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

    // Xóa hóa đơn bán hàng (204 No Content | 404 Not Found)
    deleteInvoiceSale: async (id, idQuery) => {
        const invoiceSale = await InvoiceSale.findByPk(id);
        if (!invoiceSale) {
            throw new AppError('Không tìm thấy hóa đơn bán hàng để xóa', 404);
        }
        if (invoiceSale.created_by !== idQuery) {
            throw new AppError('Bạn không có quyền xóa hóa đơn này', 403);
        }

        const transaction = await InvoiceSale.sequelize.transaction();
        try {
            const details = await InvoiceSaleDetail.findAll({
                where: { sell_id: id },
                transaction
            });

            for (const detail of details) {
                const updatedRows = await Product.update(
                    {
                        //literal có thể chứa phép toán logic  , tên cột chứa giá trị cũ của cột đố
                        //trong trường hợp này thì nó sẽ lấy giá trị cũ của sản phẩm để trừ đi số lượng đã mua
                        quantity: Product.sequelize.literal(
                            `quantity + ${parseFloat(detail.quantity)}`
                        )
                    },
                    {
                        where: {
                            id: detail.product_id
                            // quantity: {
                            //     [Op.gte]: parseFloat(item.quantity)
                            // } // Chỉ cập nhật nếu đủ số lượng
                        },
                        transaction,
                        lock: transaction.LOCK.UPDATE
                    }
                );

                if (updatedRows[0] === 0) {
                    throw new AppError(
                        `Không thể hoàn lại tồn kho cho sản phẩm ${detail.product_id}`,
                        500
                    );
                }
            }

            await InvoiceSaleDetail.destroy({
                where: { sell_id: id },
                transaction
            });

            await invoiceSale.destroy({ transaction });
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

module.exports = invoiceSaleService;
