const User = require("../../models/user.model");

const middlewareAuth = (req, res, next) => {
  const token = req.headers["authorization"]; // Lấy token từ header

  if (!token) {
    return res.status(403).json({ message: "Không có quyền truy cập" });
  }

  // Kiểm tra token trong cơ sở dữ liệu hoặc so sánh trực tiếp với giá trị cố định
  if (token === "OuIn9u3fpnHLpahbcD4M8u4uyN61u1") {
    next(); // Nếu token hợp lệ, tiếp tục
  } else {
    return res.status(403).json({ message: "Token không hợp lệ" });
  }
};

module.exports = middlewareAuth;
