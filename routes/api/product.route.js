const express = require("express");
const router = express.Router();

const controller = require("../../controllers/api/product.controller");

router.get("/", controller.index);

router.get("/deleted", controller.deleted);

router.get("/detail/:id", controller.detail);

router.post("/create", controller.create);

router.patch("/edit/:id", controller.edit);

module.exports = router;
