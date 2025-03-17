const multer = require('multer');
const path = require('path');
// Lấy đường dẫn từ biến môi trường
const uploadFolder = process.env.UPLOADS_FOLDER || 'uploads'; // Nếu không có biến môi trường, mặc định là 'uploads'
const MAX_FILE_SIZE_BYTES = parseInt(process.env.MAX_FILE_SIZE_BYTES) || 100000;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Cập nhật lại đường dẫn chính xác
        const uploadPath = path.join(__dirname, `../${uploadFolder}`); // Đảm bảo đường dẫn tới thư mục uploads
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, 'product-' + uniqueSuffix); // Tên file ảnh
    }
});

const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép tải lên các file ảnh: jpeg, jpg, png'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE_BYTES // Giới hạn dung lượng file theo byte
    }
});

module.exports = upload;
