const dashboardRouters = require("./dashboard.route");
const systemAdmin = require("../../config/system");
const productRouters = require("./product.route");
const productCategoryRouters = require("./product-category.route");
const roleRouters = require("./role.route");

module.exports = (app) => {
  const PATH_ADMIN = systemAdmin.prefixAdmin;

  app.use(PATH_ADMIN + "/dashboard", dashboardRouters);
  app.use(PATH_ADMIN + "/car_items", productRouters);
  app.use(PATH_ADMIN + "/car_items-category", productCategoryRouters);
  app.use(PATH_ADMIN + "/roles", roleRouters);
};
