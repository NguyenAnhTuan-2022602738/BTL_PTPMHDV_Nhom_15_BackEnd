const Car_items = require("../../models/product.model");
const paginationHelper = require("../../helpers/pagination");
const searchHelper = require("../../helpers/search");

//[GET] /api/car_items
module.exports.index = async (req, res) => {
  let find = {
    deleted: false,
  };

  //Tối ưu tìm kiếm
  const objectSearch = searchHelper(req.query);

  if (objectSearch.regex) {
    find.brand = objectSearch.regex;
  }
  //End Tối ưu tìm kiếm

  //sort
  let sort = {};
  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  }
  //End sort
  const countCars = await Car_items.countDocuments(find);
  //Pagination
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 10,
    },
    req.query,
    countCars
  );
  //End Pagination

  const car_items = await Car_items.find(find)
    .select("name brand version price vehicle_segment imageUrl")
    .sort(sort)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

  res.json(car_items);
};

//[GET] /api/car_items/detail
module.exports.detail = async (req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id,
    };
    const car = await Car_items.findOne(find);

    res.json(car);
  } catch (error) {
    res.json("Không tìm thấy");
  }
};

//[GET] /api/car_items/deleted
module.exports.deleted = async (req, res) => {
  const car_items = await Car_items.find({
    deleted: true,
  }).select("name version price vehicle_segment imageUrl[0]");

  res.json(car_items);
};

// [POST] /api/car_items/create
module.exports.create = async (req, res) => {
  try {
    const formData = {};

    // Xử lý dữ liệu từ req.body
    for (const key in req.body) {
      if (key.endsWith("_checked")) {
        const baseKey = key.replace("_checked", "");
        const textValue = req.body[baseKey]?.trim() || "";
        const isChecked = req.body[key] === "on";

        // Lưu giá trị text nếu có, nếu không thì lưu "true" hoặc "false" dựa trên checkbox
        formData[baseKey] = textValue
          ? textValue
          : isChecked
          ? "true"
          : "false";
      } else if (!formData.hasOwnProperty(key)) {
        // Nếu trường này là chuỗi và không trống thì lưu lại, nếu không thì gán là "Đang cập nhật"
        formData[key] =
          typeof req.body[key] === "string" && req.body[key].trim()
            ? req.body[key].trim()
            : "Đang cập nhật";
      }
    }

    // Kiểm tra trùng lặp version, name và brand
    // Loại bỏ khoảng trắng thừa ở các trường quan trọng để kiểm tra chính xác
    formData.version = formData.version?.trim();
    formData.name = formData.name?.trim();
    formData.brand = formData.brand?.trim();

    // Kiểm tra trùng lặp trong cơ sở dữ liệu
    const existingCar = await Car_items.findOne({
      version: formData.version,
      name: formData.name,
      brand: formData.brand,
    });

    if (existingCar) {
      return res.status(409).json({
        code: 409,
        message: "Trùng sản phẩm!",
      });
    }

    // Xử lý URL ảnh
    formData.imageUrl =
      req.body.imageUrl && Array.isArray(req.body.imageUrl)
        ? req.body.imageUrl
        : [];

    // Tạo bản ghi mới
    const car = new Car_items(formData);
    const data = await car.save();

    res.status(200).json({
      code: 200,
      message: "Tạo thành công",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Lỗi hệ thống",
    });
  }
};

// [PATCH] /api/car_items/edit/:id
module.exports.edit = async (req, res) => {
  const formData = {};

  // Lặp qua các trường trong form
  for (const key in req.body) {
    if (key.endsWith("_checked")) {
      const baseKey = key.replace("_checked", "");
      const textValue = req.body[baseKey]?.trim() || "";
      const isChecked = req.body[key] === "on";

      // Lưu giá trị văn bản nếu có, nếu không lưu 'true' hoặc 'false' dựa trên checkbox
      formData[baseKey] = textValue ? textValue : isChecked ? "true" : "false";
    } else if (!formData.hasOwnProperty(key)) {
      formData[key] =
        typeof req.body[key] === "string"
          ? req.body[key].trim()
          : "Đang cập nhật";
    }
  }

  try {
    // Lấy xe cũ từ cơ sở dữ liệu
    const existingCar = await Car_items.findById(req.params.id);
    if (!existingCar) {
      return res.status(404).json({
        code: 404,
        message: "Không tìm thấy xe để chỉnh sửa.",
      });
    }

    // Lấy các đường dẫn hình ảnh cũ từ car.imageUrl
    const existingImages = existingCar.imageUrl || [];
    formData.imageUrl = existingImages; // Khởi tạo với ảnh cũ

    // Nếu có ảnh mới được upload lên Cloudinary, gộp chúng vào mảng imageUrl
    if (req.body.imageUrl && req.body.imageUrl.length > 0) {
      formData.imageUrl = [...formData.imageUrl, ...req.body.imageUrl]; // Gộp các ảnh cũ và mới
    }

    // Cập nhật thông tin xe trong cơ sở dữ liệu
    await Car_items.updateOne(
      { _id: req.params.id },
      { $set: formData } // Cập nhật các trường trong formData
    );

    // Trả về kết quả thành công
    return res.status(200).json({
      code: 200,
      message: "Sửa xe thành công!",
      data: formData, // Trả lại dữ liệu đã cập nhật
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Có lỗi xảy ra trong quá trình lưu dữ liệu.",
    });
  }
};
