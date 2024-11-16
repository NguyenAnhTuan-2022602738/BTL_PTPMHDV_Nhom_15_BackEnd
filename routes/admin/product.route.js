const express = require("express");
const multer = require("multer");
const router = express.Router();
// const storageMulter = require("../../helpers/storageMulter");
const upload = multer();
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");


const controller = require("../../controllers/admin/product.controller");
const validate = require("../../validates/admin/product.validate");

const axios = require("axios");
const BASE_API_URL = "https://btl-ptpmhdv-nhom-15.vercel.app/api"; 

router.get("/", controller.index);

router.delete(`/delete/:id`, controller.deleteItem);

router.patch(`/change-multi`, controller.changeMulti);

router.get("/create", controller.create);

router.post(
  "/create",
  upload.array("imageUrl", 10), // Adjust number of files as needed
  uploadCloud.upload,
  validate.createPost,
  controller.createPost
);

router.post(
    "/import",
    upload.single("file"),
    uploadCloud.upload,
    controller.importCarItems
  );
  

router.get("/edit/:id", controller.edit);

router.patch(
  "/edit/:id",
  upload.array("imageUrl", 10),
  uploadCloud.upload,
  validate.createPost,
  controller.editPatch
);

router.get("/detail/:id", controller.detail);

module.exports = router;
