const express = require("express");
const router = express.Router();

const controller = require("../../controllers/api/product.controller");

router.get("/", controller.index);

router.get("/deleted", controller.deleted);

router.get("/detail/:id", controller.detail);

router.post("/create", controller.create);

router.post("/createByFileImport", controller.createByFileImport);

router.patch("/edit/:id", controller.edit);

router.delete("/delete/:id", controller.delete);

router.patch("/change_multi", controller.changeMulti);//xóa nhiều xe cùng lúc

router.delete("/deleteDB/:id", controller.deleteDB);

router.patch("/undo-delete/:id", controller.undoDelete);

router.get("/count_by_segment", controller.countBySegment);

router.get("/countByBrand", controller.countByBrand);

router.get("/popularCars", controller.getMostClickedCars);

router.post("/:id/click", controller.incrementClick);

// API lấy tất cả các thương hiệu
router.get('/brands', controller.getBrands);

// API lấy các mẫu xe theo thương hiệu
router.get('/models/:brand', controller.getModelsByBrand);

// API lấy các phiên bản xe theo mẫu xe
router.get('/versions/:model', controller.getVersionsByModel);

router.get('/mucTieuThuNhienLieu', controller.getmucTieuThuNhienLieu);
module.exports = router;
