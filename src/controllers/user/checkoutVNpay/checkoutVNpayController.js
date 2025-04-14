// const catchAsync = require('../../../utils/catchAsync');
// const ApiResponse = require('../../../utils/apiResponse');
// const checkoutVNPayService = require('../../../services/user/checkoutVNPay/checkoutVNPayService');

// const CheckoutVNPayController = {
//     createPayMent: catchAsync(async (req, res) => {
//         let ipAddr = req.ip;
//         const { amount } = req.query;
//         let bankCode = req.query.bankCode || 'NCB';
//         let locale = req.query.language || 'vn';

//         const data = { ipAddr, amount, bankCode, locale };

//         const response = await checkoutVNPayService.createPayMent(data);

//         return ApiResponse.success(
//             res,
//             response,
//             'Lấy  thông tin thanh toán từ VNPAY thành công',
//             200
//         );
//     })
// };

// module.exports = CheckoutVNPayController;
