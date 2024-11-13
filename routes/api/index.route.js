const systemApi = require("../../config/system");
const productRouters = require("./product.route");

module.exports = (app) => {
  const PATH_API = systemApi.prefixApi;

  app.use(PATH_API+ "/car_items", productRouters);
};
