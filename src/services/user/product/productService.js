const Product = require('../../../db/models/product');
const Tax = require('../../../db/models/tax');
const Unit = require('../../../db/models/unit');
const Category = require('../../../db/models/category');
const Brand = require('../../../db/models/brand');
const User = require('../../../db/models/user');
const AppError = require('../../../utils/appError');
const {
    getProductById
} = require('../../../controllers/user/products/productController');

const productService = {
    // Lấy tất cả sản phẩm
    getAllProducts: async user => {
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
                created_by: user.id
            }
        });
    },

    // Lấy thông tin chi tiết sản phẩm theo ID
    getProductById: async id => {
        if (!id) throw new AppError('ID sản phẩm là bắt buộc', 400);

        const product = await Product.findByPk(id, {
            include: [
                { model: Tax, as: 'tax' },
                { model: Unit, as: 'unit' },
                { model: Category, as: 'category' },
                { model: Brand, as: 'brand' },
                { model: User, as: 'creator' }
            ]
        });

        if (!product) throw new AppError('Sản phẩm không tồn tại', 404);
        return product;
    },

    ProductGetInit: async user => {
        let result = [];

        const resultTax = await Tax.findAll({
            attributes: ['id', 'name'],
            where: {
                created_by: user.id
            }
        });
        const resultUnit = await Unit.findAll({
            attributes: ['id', 'name'],
            where: {
                created_by: user.id
            }
        });
        const resultCategory = await Category.findAll({
            attributes: ['id', 'name'],
            where: {
                created_by: user.id
            }
        });

        const resultBrand = await Brand.findAll({
            attributes: ['id', 'name'],
            where: {
                created_by: user.id
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
    createProductPost: async (data, user) => {
        // Kiểm tra các trường bắt buộc
        if (!data.name || !data.slug || !data.sale_price) {
            throw new AppError('Tên, slug và giá bán là bắt buộc', 400);
        }

        // Kiểm tra và lưu ảnh nếu có
        const image = data.image || null; // Kiểm tra ảnh nếu có

        return await Product.create({
            name: data.name,
            slug: data.slug,
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
            created_by: user.id
        });
    },

    // Cập nhật thông tin sản phẩm
    updateProduct: async (id, data) => {
        if (!data) {
            throw new AppError('Bạn chuyền gì đó đi', 404);
        }
        if (!id) throw new AppError('ID sản phẩm là bắt buộc', 400);

        const product = await Product.findByPk(id);
        if (!product) throw new AppError('Sản phẩm không tồn tại', 404);

        // Kiểm tra và cập nhật ảnh nếu có
        const image = data.image || product.image; // Cập nhật ảnh nếu có ảnh mới

        return await product.update({
            name: data.name || product.name,
            slug: data.slug || product.slug,
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
                data.quantity !== undefined ? data.quantity : product.quantity,
            tax_id: data.tax_id !== undefined ? data.tax_id : product.tax_id,
            unit_id:
                data.unit_id !== undefined ? data.unit_id : product.unit_id,
            category_id:
                data.category_id !== undefined
                    ? data.category_id
                    : product.category_id,
            brand_id:
                data.brand_id !== undefined ? data.brand_id : product.brand_id,
            image: image, // Cập nhật ảnh
            product_type:
                data.product_type !== undefined
                    ? data.product_type
                    : product.product_type
        });
    },

    // Xóa sản phẩm
    deleteProduct: async id => {
        if (!id) throw new AppError('ID sản phẩm là bắt buộc', 400);

        const product = await Product.findByPk(id);
        if (!product) throw new AppError('Sản phẩm không tồn tại', 404);

        await product.destroy();
        return { message: 'Sản phẩm đã được xóa thành công' };
    }
};

module.exports = productService;
