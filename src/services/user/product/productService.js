const Product = require('../../../db/models/product');
const Tax = require('../../../db/models/tax');
const Unit = require('../../../db/models/unit');
const Category = require('../../../db/models/category');
const Brand = require('../../../db/models/brand');
const User = require('../../../db/models/user');
const AppError = require('../../../utils/appError');
const { Op } = require('sequelize');

const {
    getProductById
} = require('../../../controllers/user/products/productController');

const productService = {
    // Lấy tất cả sản phẩm
    getAllProducts: async idQuery => {
        return await Product.findAll({
            include: [
                // { model: Tax, as: 'tax' },
                // { model: Unit, as: 'unit' },
                { model: Category, as: 'category', attributes: ['id', 'name'] },
                { model: Brand, as: 'brand', attributes: ['id', 'name'] }
                // { model: User, as: 'creator' }
            ],
            order: [['created_at', 'DESC']],

            where: {
                created_by: idQuery
            }
        });
    },

    // Lấy thông tin chi tiết sản phẩm theo ID
    getProductById: async (id, idQuery) => {
        if (!id) throw new AppError('ID sản phẩm là bắt buộc', 400);

        const product = await Product.findOne({
            include: [
                { model: Tax, as: 'tax' },
                { model: Unit, as: 'unit' },
                { model: Category, as: 'category' },
                { model: Brand, as: 'brand' },
                { model: User, as: 'creator' }
            ],
            where: {
                id: id,
                created_by: idQuery
            }
        });

        if (!product) throw new AppError('Sản phẩm không tồn tại', 404);
        return product;
    },

    ProductGetInit: async idQuery => {
        let result = [];

        const resultTax = await Tax.findAll({
            attributes: ['id', 'name'],
            where: {
                created_by: idQuery
            }
        });
        const resultUnit = await Unit.findAll({
            attributes: ['id', 'name'],
            where: {
                created_by: idQuery
            }
        });
        const resultCategory = await Category.findAll({
            attributes: ['id', 'name'],
            where: {
                created_by: idQuery
            }
        });

        const resultBrand = await Brand.findAll({
            attributes: ['id', 'name'],
            where: {
                created_by: idQuery
            }
        });

        result = {
            tax: resultTax,
            unit: resultUnit,
            category: resultCategory,
            brand: resultBrand
        };

        return result;
    },

    // Tạo sản phẩm mới
    createProductPost: async (data, idQuery) => {
        const transaction = await Product.sequelize.transaction();
        try {
            // Kiểm tra các trường bắt buộc
            if (!data.name || !data.sale_price) {
                throw new AppError('Tên và giá bán là bắt buộc', 400);
            }

            const productNameExist = await Product.findOne({
                where: {
                    name: data.name,
                    created_by: idQuery
                }
            });

            if (productNameExist) {
                return new AppError('Tên sản phẩm đã tồn tại', 409);
            }

            // Kiểm tra và lưu ảnh nếu có
            const image = data.image || null; // Kiểm tra ảnh nếu có

            const product = await Product.create(
                {
                    name: data.name,
                    sku: data.sku || null,
                    purchase_price: data.purchase_price || 0,
                    sale_price: data.sale_price,
                    description: data.description || '',
                    tax_id: data.tax_id,
                    unit_id: data.unit_id,
                    category_id: data.category_id,
                    brand_id: data.brand_id,
                    image: image, // Lưu tên ảnh vào DB nếu có
                    product_type: data.product_type || 0,
                    created_by: idQuery
                },
                { transaction }
            );

            await transaction.commit();
            return product;
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

    // Cập nhật thông tin sản phẩm
    updateProduct: async (id, idQuery, data) => {
        const transaction = await Product.sequelize.transaction();
        try {
            if (!data) {
                throw new AppError('Bạn chuyền gì đó đi', 404);
            }
            if (!id) throw new AppError('ID sản phẩm là bắt buộc', 400);

            const product = await Product.findOne({
                where: {
                    id: id,
                    created_by: idQuery
                }
            });
            if (!product) throw new AppError('Sản phẩm không tồn tại', 404);

            if (data.name != undefined) {
                const isExistProductName = await Product.findOne({
                    where: {
                        name: data.name,
                        created_by: idQuery,
                        id: { [Op.ne]: id } // Loại bỏ danh mục hiện tại khỏi kết quả
                    }
                });

                if (isExistProductName) {
                    return new AppError('Tên sản phẩm đã tồn tại', 409);
                }
            }

            // Kiểm tra và cập nhật ảnh nếu có
            const image = data.image || product.image; // Cập nhật ảnh nếu có ảnh mới

            const productUpdate = await product.update(
                {
                    name: data.name || product.name,
                    sku: data.sku !== undefined ? data.sku : product.sku,
                    purchase_price:
                        data.purchase_price !== undefined
                            ? data.purchase_price
                            : product.purchase_price,
                    sale_price:
                        data.sale_price !== undefined
                            ? data.sale_price
                            : product.sale_price,
                    description:
                        data.description !== undefined
                            ? data.description
                            : product.description,
                    quantity:
                        data.quantity !== undefined
                            ? data.quantity
                            : product.quantity,
                    tax_id:
                        data.tax_id !== undefined
                            ? data.tax_id
                            : product.tax_id,
                    unit_id:
                        data.unit_id !== undefined
                            ? data.unit_id
                            : product.unit_id,
                    category_id:
                        data.category_id !== undefined
                            ? data.category_id
                            : product.category_id,
                    brand_id:
                        data.brand_id !== undefined
                            ? data.brand_id
                            : product.brand_id,
                    image: image, // Cập nhật ảnh
                    product_type:
                        data.product_type !== undefined
                            ? data.product_type
                            : product.product_type
                },
                { transaction }
            );
            // Commit transaction nếu thành công
            await transaction.commit();
            return productUpdate;
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

    // Xóa sản phẩm
    deleteProduct: async (id, idQuery) => {
        console.log('idQuery ---', idQuery);
        const transaction = await Product.sequelize.transaction();
        try {
            if (!id) throw new AppError('ID sản phẩm là bắt buộc', 400);

            const product = await Product.findOne({
                where: {
                    id: id,
                    created_by: idQuery
                }
            });
            if (!product) throw new AppError('Sản phẩm không tồn tại', 404);

            await product.destroy({ transaction });
            await transaction.commit();
            return { message: 'Sản phẩm đã được xóa thành công' };
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

module.exports = productService;
