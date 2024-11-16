module.exports = (query) => {
    let objectSearch = {
      searchKey: "", // Trường tìm kiếm (e.g., brand, name)
      searchValue: "", // Giá trị tìm kiếm
      regex: null, // Biểu thức regex (nếu cần)
    };
  
    // Kiểm tra nếu có searchValue trong query
    if (query.searchValue) {
      objectSearch.searchValue = query.searchValue.trim(); // Xử lý chuỗi trắng
  
      // Tạo regex tìm kiếm không phân biệt hoa thường
      objectSearch.regex = new RegExp(objectSearch.searchValue, "i");
    }
  
    // Kiểm tra nếu có searchKey trong query
    if (query.searchKey) {
      // Chỉ sử dụng searchKey nếu nó là giá trị hợp lệ
      if (["brand", "name"].includes(query.searchKey)) {
        objectSearch.searchKey = query.searchKey;
      }
    }
  
    return objectSearch;
  };
  