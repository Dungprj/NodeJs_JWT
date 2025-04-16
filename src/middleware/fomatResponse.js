const common = require('../common/common');
const formatResponse = (req, res, next) => {
    console.log('dang format --------------------------------');
    // Lưu trữ phương thức res.json gốc
    const originalJson = res.json;

    // Ghi đè phương thức res.json
    res.json = function (data) {
        console.log(
            'data la ---------------------------------------------------------------------------------------- ',
            data
        );

        // Gọi phương thức res.json gốc với dữ liệu đã format
        return originalJson.call(this, data);
    };

    next(); // Tiếp tục middleware chain
};

module.exports = formatResponse;
