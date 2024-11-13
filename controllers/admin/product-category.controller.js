
//[GET] /admin/car_items-category
module.exports.index = async (req, res) => {

  res.render("admin/pages/product-category/index", {
    pageTitle: "Danh mục xe"
  });
};

