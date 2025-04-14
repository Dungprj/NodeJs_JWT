require('dotenv').config();
const qs = require('querystring');
const moment = require('moment');

const crypto = require('crypto');

function sortObject(obj) {
    let sorted = {};
    let keys = Object.keys(obj).sort();
    keys.forEach(key => {
        sorted[key] = obj[key];
    });
    return sorted;
}

const checkoutVNPayService = {
    createPayMent: async data => {
        const ipAddr = data.ip || '127.0.0.1';
        const amount = parseFloat(data.amount); // Ensure amount is a number
        const bankCode = data.bankCode || 'NCB';
        const locale = data.language || 'vn';

        // Validate amount
        if (isNaN(amount) || amount <= 0) {
            throw new Error('Invalid amount');
        }

        const tmnCode = process.env.TMNCODE;
        const secretKey = process.env.SECRETKEY_VNPAY;

        const returnUrl = process.env.RETURN_URL;
        const vnp_Url = process.env.VNP_URL;

        let orderId = moment().format('YYYYMMDDHHmmss');

        let createDate = moment().format('YYYYMMDDHHmmss');
        let orderInfo = 'Thanh_toan_don_hang';

        let currCode = 'VND';

        let vnp_Params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: tmnCode,
            vnp_Locale: locale,
            vnp_CurrCode: currCode,
            vnp_TxnRef: orderId,
            vnp_OrderInfo: orderInfo,
            vnp_OrderType: 'billpayment',
            vnp_Amount: amount * 100,
            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: createDate
        };

        if (bankCode !== '') {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        vnp_Params = sortObject(vnp_Params);

        let signData = qs.stringify(vnp_Params);
        let hmac = crypto.createHmac('sha512', secretKey);
        let signed = hmac
            .update(new Buffer.from(signData, 'utf-8'))
            .digest('hex');
        vnp_Params['vnp_SecureHash'] = signed;

        let paymentUrl = vnp_Url + '?' + qs.stringify(vnp_Params);

        return paymentUrl;
    }
};

module.exports = checkoutVNPayService;
