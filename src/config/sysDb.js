const sequelize = require('./db'); // Kết nối với Sequelize

// Đồng bộ cơ sở dữ liệu
const sysDb = async () => {
    try {
        await sequelize.authenticate(); // Kết nối cơ sở dữ liệu
        console.log('Kết nối cơ sở dữ liệu thành công!');

        // Đồng bộ hóa cơ sở dữ liệu
        await sequelize.sync({ force: false }); // Tùy chọn force: false để không xóa bảng cũ
        console.log('Các bảng đã được đồng bộ!');
    } catch (error) {
        console.error('Lỗi kết nối cơ sở dữ liệu:', error);
    }
};

module.exports = sysDb;
