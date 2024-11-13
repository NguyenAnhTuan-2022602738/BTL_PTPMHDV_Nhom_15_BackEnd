const Car_items = require("../../models/product.model");

//[GET] /api/car_items
module.exports.index = async (req, res) => {
  const car_items = await Car_items.find({
    deleted: false,
  }).select("name version price vehicle_segment");

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
  }).select("name version price vehicle_segment");

  res.json(car_items);
};





