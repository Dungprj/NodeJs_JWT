// const express = require('express');

// const checkoutVNPayController = require('../../../controllers/user/checkoutVNpay/checkoutVNpayController');
// // const checkPermission = require('../../../middleware/permission');
// const paymentRouter = express.Router();

// paymentRouter.get('/create_payment', checkoutVNPayController.createPayMent);

// // paymentRouter.get('/check_payment', (req, res) => {
// //     const query = req.query;
// //     const secretKey = 'PBNLKF8YGRNCPXLDJLY9V1023CW8206U';
// //     const vnp_SecureHash = query.vnp_SecureHash;

// //     delete query.vnp_SecureHash;
// //     const signData = qs.stringify(query);

// //     const hmac = CryptoJS.createHmac('sha512', secretKey);
// //     const checkSum = hmac.update(signData).digest('hex');
// //     console.log(query);

// //     if (vnp_SecureHash === checkSum) {
// //         if (query.vnp_ResponseCode === '00') {
// //             res.json({ message: 'Thanh toán thành công', data: query });
// //         } else {
// //             res.json({ message: 'Thanh toán thất bại', data: query });
// //         }
// //     } else {
// //         res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
// //     }
// // });

// module.exports = paymentRouter;
