const Car_items = require("../../models/product.model");
const paginationHelper = require("../../helpers/pagination");
const searchHelper = require("../../helpers/search");
const cloudinary = require("../../middlewares/admin/uploadCloud.middleware")

//[GET] /api/car_items
module.exports.index = async (req, res) => {
  try {
    let find = { deleted: false };
    
    // Tối ưu tìm kiếm
    const objectSearch = searchHelper(req.query);
    if (objectSearch.regex) {
      // Kiểm tra searchKey để quyết định tìm kiếm theo brand hay name
      if (req.query.searchKey === 'brand') {
        find.brand = objectSearch.regex;
      } else if (req.query.searchKey === 'name') {
        find.name = objectSearch.regex;
      }
    }

    // Sort
    let sort = {};
    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = req.query.sortValue; // Sắp xếp theo các key và value
    }

    // Đếm tổng số xe
    const countCars = await Car_items.countDocuments(find);

    // Pagination
    let objectPagination = paginationHelper(
      {
        currentPage: 1,
        limitItems: 10,
      },
      req.query,
      countCars
    );

    // Fetch data từ cơ sở dữ liệu
    const car_items = await Car_items.find(find)
      .select("name brand version price vehicle_segment imageUrl")
      .sort(sort)
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip);

    // Trả về dữ liệu
    res.json({
      cars: car_items,
      totalCars: countCars,
      totalPages: Math.ceil(countCars / objectPagination.limitItems),
      currentPage: objectPagination.currentPage,
    });
  } catch (error) {
    console.error("Error fetching car items:", error);
    res.status(500).json({ message: "Có lỗi xảy ra." });
  }
};

//[GET] /api/car_items/detail
module.exports.detail = async (req, res) => {
  try {
    const { id } = req.params; // Lấy id từ tham số đường dẫn
    const find = {
      deleted: false,
      _id: id,
    };

    const car = await Car_items.findOne(find);
    if (!car) {
      return res.status(404).json({ message: "Không tìm thấy xe" });
    }

    res.json(car);
  } catch (error) {
    console.error("Lỗi khi tìm chi tiết xe:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};


//[GET] /api/car_items/deleted
module.exports.deleted = async (req, res) => {
  try {
    let find = { deleted: true };
    
    // Tối ưu tìm kiếm
    const objectSearch = searchHelper(req.query);
    if (objectSearch.regex) {
      // Kiểm tra searchKey để quyết định tìm kiếm theo brand hay name
      if (req.query.searchKey === 'brand') {
        find.brand = objectSearch.regex;
      } else if (req.query.searchKey === 'name') {
        find.name = objectSearch.regex;
      }
    }

    // Sort
    let sort = {};
    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = req.query.sortValue; // Sắp xếp theo các key và value
    }

    // Đếm tổng số xe
    const countCars = await Car_items.countDocuments(find);

    // Pagination
    let objectPagination = paginationHelper(
      {
        currentPage: 1,
        limitItems: 10,
      },
      req.query,
      countCars
    );

    // Fetch data từ cơ sở dữ liệu
    const car_items = await Car_items.find(find)
      .select("name brand version price vehicle_segment imageUrl")
      .sort(sort)
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip);

    // Trả về dữ liệu
    res.json({
      cars: car_items,
      totalCars: countCars,
      totalPages: Math.ceil(countCars / objectPagination.limitItems),
      currentPage: objectPagination.currentPage,
    });
  } catch (error) {
    console.error("Error fetching car items:", error);
    res.status(500).json({ message: "Có lỗi xảy ra." });
  }
};

// [POST] /api/car_items/create
module.exports.create = async (req, res) => {
  try {
    const formData = {};

    // Lưu dữ liệu từ req.body
    for (const key in req.body) {
      if (key.endsWith("_checked")) {
        const baseKey = key.replace("_checked", "");
        const textValue = req.body[baseKey]?.trim() || "";
        const isChecked = req.body[key] === "on";

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
    formData.version = formData.version?.trim();
    formData.name = formData.name?.trim();
    formData.brand = formData.brand?.trim();

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

    // URL hình đã được lưu vào req.body.imageUrl từ middleware
    formData.imageUrl = req.body.imageUrl; // URL hình ảnh từ Cloudinary

    // Tạo bản ghi mới
    const car = new Car_items(formData);
    const data = await car.save();

    res.status(200).json({
      code: 200,
      message: "Tạo thành công",
      data: data,
    });
  } catch (error) {
    console.error("Error saving car:", error);
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
      // Đảm bảo trường 'deleted' luôn luôn bằng false
      if (key === 'deleted') {
        formData[key] = false;  // Gán 'deleted' luôn bằng false
      } else {
        // Các trường khác vẫn xử lý như bình thường
        formData[key] = typeof req.body[key] === "string" ? req.body[key].trim() : "Đang cập nhật";
      }
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
    formData.imageUrl = [...existingImages]; // Khởi tạo với ảnh cũ

    // Nếu có ảnh mới được upload lên Cloudinary, gộp chúng vào mảng imageUrl
    if (req.body.imageUrl && req.body.imageUrl.length > 0) {
      // Kiểm tra và chỉ thêm ảnh mới nếu chưa có trong mảng ảnh cũ
      req.body.imageUrl.forEach(image => {
        if (!existingImages.includes(image)) {
          formData.imageUrl.push(image);  // Thêm ảnh mới nếu chưa có
        }
      });
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




//[DELETE] /api/car_items/delete/:id
module.exports.delete = async (req, res) => {
  const id = req.params.id;
  try {
    //await Car_items.deleteOne({ _id: id});
    await Car_items.updateOne(
      { _id: id },
      { deleted: true, deletedAt: new Date() }
    );
    return res.status(200).json({
      code: 200,
      message: "Xóa thành công",
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: "Lỗi",
    });
  }
};

//[PATCH] /admin/car_items/change-multi
module.exports.changeMulti = async (req, res) => {
  try {
    const { ids, type } = req.body;

    // Kiểm tra nếu ids và type được cung cấp
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: "Invalid ids provided.",
      });
    }

    switch (type) {
      case "delete-multi":
        await Car_items.updateMany(
          { _id: { $in: ids } },
          { deleted: true, deletedAt: new Date() }
        );
        return res.status(200).json({
          code: 200,
          message: `Xóa thành công ${ids.length} xe.`,
        });

      default:
        return res.status(400).json({
          code: 400,
          message: "Invalid operation type provided.",
        });
    }
  } catch (error) {
    console.error("Error in changeMulti:", error); // Để dễ dàng debug
    return res.status(500).json({
      code: 500,
      message: "Có lỗi xảy ra trong quá trình xử lý yêu cầu.",
    });
  }
};

// [GET] /api/car_items/count_by_segment
module.exports.countBySegment = async (req, res) => {
  try {
    const counts = await Car_items.aggregate([
      { $match: { deleted: false } },
      { $group: { _id: "$vehicle_segment", count: { $sum: 1 } } }
    ]);
    
    res.json(counts.map(segment => ({
      vehicle_segment: segment._id,
      count: segment.count
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Có lỗi xảy ra." });
  }
};

// [DELETE] /api/car_items/deleteDB/:id
module.exports.deleteDB = async (req, res) => {
  const { id } = req.params;  // Lấy ID xe từ URL

  try {
    // Xóa vĩnh viễn một chiếc xe khỏi cơ sở dữ liệu
    const result = await Car_items.deleteOne({ _id: id });

    // Kiểm tra xem có bản ghi nào bị xóa không
    if (result.deletedCount === 0) {
      return res.status(404).json({
        code: 404,
        message: "Không tìm thấy xe để xóa.",
      });
    }

    // Trả về kết quả thành công
    return res.status(200).json({
      code: 200,
      message: "Xóa thành công chiếc xe khỏi cơ sở dữ liệu.",
    });
  } catch (error) {
    console.error("Lỗi khi xóa xe:", error);
    return res.status(500).json({
      code: 500,
      message: "Có lỗi xảy ra trong quá trình xóa xe.",
    });
  }
};

// [PATCH] /api/car_items/undo-delete/:id
module.exports.undoDelete = async (req, res) => {
  const { id } = req.params;  // Lấy ID xe từ URL

  try {
    // Cập nhật trạng thái deleted thành false để khôi phục lại xe
    const result = await Car_items.updateOne(
      { _id: id },
      { $set: { deleted: false, updatedAt: new Date() } }
    );

    // Kiểm tra xem có bản ghi nào được cập nhật không
    if (result.modifiedCount === 0) {
      return res.status(404).json({
        code: 404,
        message: "Không tìm thấy xe để hoàn tác.",
      });
    }

    // Trả về kết quả thành công
    return res.status(200).json({
      code: 200,
      message: "Khôi phục thành công chiếc xe.",
    });
  } catch (error) {
    console.error("Lỗi khi khôi phục xe:", error);
    return res.status(500).json({
      code: 500,
      message: "Có lỗi xảy ra trong quá trình khôi phục xe.",
    });
  }
};

module.exports.getNewCars = async (req, res) =>{
  try {
    // Tìm xe chưa bị xóa
    let find = { deleted: false };

    // Lấy 4 xe mới nhất (sắp xếp theo _id giảm dần để lấy xe mới nhất)
    const newCars = await Car_items.find(find)
      .select("name brand version price vehicle_segment imageUrl")
      .sort({ _id: -1 })  // Sắp xếp theo _id giảm dần (xe mới nhất)
      .limit(4);  // Lấy 4 xe

    // Trả về dữ liệu
    res.json({cars: newCars});
  } catch (error) {
    console.error("Error fetching new cars:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi lấy xe mới." });
  }
}

// [POST] /api/car_items/:id/click
module.exports.incrementClick = async (req, res) => {
  const carId = req.params.id;

  try {
    // Tìm xe theo ID
    const car = await Car_items.findById(carId);

    if (!car) {
      return res.status(404).json({ message: 'Xe không tìm thấy' });
    }

    // Tăng số lượt click
    car.clickCount = car.clickCount ? car.clickCount + 1 : 1;  // Nếu chưa có clickCount thì gán là 1

    // Lưu lại
    await car.save();

    // Trả về thông báo thành công
    res.json({ message: 'Lượt click đã được cập nhật', clickCount: car.clickCount });
  } catch (error) {
    console.error("Error updating click count:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi cập nhật lượt click." });
  }
};

//[GET] /api/car_items/brands
module.exports.getBrands = async (req, res) => {
  try {
    // Lấy danh sách tất cả các thương hiệu (không trùng lặp)
    const brands = await Car_items.distinct("brand"); // Lấy danh sách các thương hiệu không trùng lặp
    console.log(brands);
    res.json({ brands });
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi lấy thương hiệu." });
  }
};

// [GET] /api/car_items/models/:brand
module.exports.getModelsByBrand = async (req, res) => {
  const { brand } = req.params;

  try {
    // Lọc xe theo thương hiệu và lấy danh sách các mẫu xe không trùng lặp
    const models = await Car_items.find({ brand })
      .distinct("name"); // Lấy danh sách các mẫu xe không trùng lặp
    res.json({ models });
  } catch (error) {
    console.error("Error fetching models:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi lấy mẫu xe." });
  }
};

// [GET] /api/car_items/versions/:model
module.exports.getVersionsByModel = async (req, res) => {
  const { model } = req.params;

  try {
    // Lọc xe theo tên mẫu và lấy tất cả các phiên bản của mẫu xe
    const versions = await Car_items.find({ name: model });

    // Trả về các phiên bản xe
    res.json({ versions });
  } catch (error) {
    console.error("Error fetching versions:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi lấy phiên bản xe." });
  }
};