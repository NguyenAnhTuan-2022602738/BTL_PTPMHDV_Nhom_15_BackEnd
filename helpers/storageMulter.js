const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Hàm để đảm bảo thư mục tồn tại
const ensureDirectoryExistence = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true }); // Tạo thư mục và các thư mục cha nếu cần
  }
};


module.exports = () => {
  const storage = multer.diskStorage({
      destination: function (req, file, cb) {
          // Đặt thư mục lưu trữ cho file
          let dest = './public/uploads/';
          // Nếu là file json hoặc csv, có thể chọn một thư mục khác nếu muốn
          if (file.mimetype === "application/json" || file.mimetype === "text/csv") {
              dest = './public/uploads/data/'; // Ví dụ, thư mục cho dữ liệu
          }
          // Đảm bảo thư mục tồn tại trước khi lưu
          ensureDirectoryExistence(dest);
          cb(null, dest);
      },
      filename: function (req, file, cb) {
          // Đặt tên file với timestamp và phần mở rộng để tránh trùng lặp
          const uniqueSuffix = Date.now() + path.extname(file.originalname); // Lấy phần mở rộng của file
          cb(null, `${uniqueSuffix}-${file.originalname}`);
      }
  });

  return storage;
}