const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const customerService = require('../../../services/user/customer/customerService');

const customerController = {
    getListCustomer: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const customers = await customerService.getAllCustomers(idQuery);
        return ApiResponse.success(
            res,
            customers,
            'Lấy danh sách khách hàng thành công',
            200
        );
    }),

    getCustomerById: catchAsync(async (req, res) => {
        const customer = await customerService.getCustomerById(req.params.id);
        return ApiResponse.success(
            res,
            customer,
            'Lấy thông tin khách hàng thành công',
            200
        );
    }),

    createCustomer: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const newCustomer = await customerService.createCustomer(
            req.body,
            idQuery
        );
        return ApiResponse.success(
            res,
            newCustomer,
            'Khách hàng đã được tạo thành công',
            201
        );
    }),

    updateCustomer: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        const updatedCustomer = await customerService.updateCustomer(
            req.params.id,
            req.body,
            idQuery
        );
        return ApiResponse.success(
            res,
            updatedCustomer,
            'Cập nhật Khách hàng thành công',
            200
        );
    }),

    deleteCustomer: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;
        await customerService.deleteCustomer(req.params.id, idQuery);
        return ApiResponse.success(
            res,
            null,
            'Khách hàng đã được xóa thành công',
            204
        );
    })
};

module.exports = customerController;
