const systemApi = require("../../config/system");
const productRouters = require("./product.route");
const userRouters = require("./user.route");

module.exports = (app) => {
  const PATH_API = systemApi.prefixApi;

  app.use(PATH_API+ "/car_items", productRouters);
  app.use(PATH_API+ "/users", userRouters);
};
