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
    .select("brand name version price vehicle_segment")
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
  }).select("name version price vehicle_segment");

  res.json(car_items);
};
