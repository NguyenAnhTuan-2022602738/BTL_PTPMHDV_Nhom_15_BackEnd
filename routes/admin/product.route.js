const express = require("express");
const multer = require("multer");
const router = express.Router();
// const storageMulter = require("../../helpers/storageMulter");
const upload = multer();
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");


const controller = require("../../controllers/admin/product.controller");
const validate = require("../../validates/admin/product.validate");

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
    async function (req, res, next) {
      if (!req.file) {
        return res.status(400).send("No file uploaded.");
      }
  
      let streamUpload = (file) => {
        return new Promise((resolve, reject) => {
          let stream = cloudinary.uploader.upload_stream((error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          });
          streamifier.createReadStream(file.buffer).pipe(stream);
        });
      };
  
      try {
        const result = await streamUpload(req.file);
        console.log(result);
  
        next();  // Proceed with the next middleware or controller
      } catch (error) {
        console.error("Upload error:", error);
        res.status(500).send("File import failed");
      }
    },
    controller.importCarItems
  );
  

router.get("/edit/:id", controller.edit);

router.patch(
  "/edit/:id",
  upload.array("imageUrl", 10),
  validate.createPost,
  controller.editPatch
);

router.get("/detail/:id", controller.detail);

module.exports = router;
