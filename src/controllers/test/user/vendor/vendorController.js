const catchAsync = require('../../../../utils/catchAsync');
const ApiResponse = require('../../../../utils/apiResponse');
const vendorService = require('../../../../services/user/vendor/vendorService');

const vendorController = {
    // Tạo mới nhà cung cấp (201 Created | 400 Bad Request)
    createVendor: catchAsync(async (req, res) => {
        const idQuery = req.idQuery;

        const result = [];

        const body = [
            {
                name: 'Nguyễn Dũng test01',
                email: 'vendorDung72272223232432323232@gmail.com',
                phone_number: '0123456789'
            },
            {
                name: 'Nguyễn Dũng test02',
                email: 'vendorDung7227232322223232432323232@gmail.com',
                phone_number: '0123456789232'
            }
        ];

        for (let i = 0; i < body.length; i++) {
            const newVendor = await vendorService.createVendor(
                body[i],
                idQuery
            );
            result.push(newVendor);
        }

        return ApiResponse.success(
            res,
            result,
            'Nhà cung cấp test đã được tạo thành công',
            201
        );
    })
};

module.exports = vendorController;
