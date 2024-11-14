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
    .select("name version price vehicle_segment imageUrl")
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
        formData[key] =
          typeof req.body[key] === "string" && req.body[key].trim()
            ? req.body[key].trim()
            : "Đang cập nhật";
      }
    }

    // Kiểm tra trùng lặp version, name và brand
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

    // Lấy URL ảnh từ `req.body.imageUrl` đã được upload ở route
    formData.imageUrl = req.body.imageUrl || [];

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
