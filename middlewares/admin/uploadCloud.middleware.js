const streamifier = require("streamifier");
const cloudinary = require("cloudinary").v2;
// cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET, // Click 'View API Keys' above to copy your API secret
});
//End cloudinary

module.exports.upload = async (req, res, next) => {
  let streamUpload = (file) => {
    return new Promise((resolve, reject) => {
      let stream = cloudinary.uploader.upload_stream((error, result) => {
        if (result) {
          resolve(result.url);
        } else {
          reject(error);
        }
      });
      streamifier.createReadStream(file.buffer).pipe(stream);
    });
  };

  try {
    // Process each file and upload to Cloudinary
    const uploadPromises = req.files.map((file) => streamUpload(file));
    const imageUrls = await Promise.all(uploadPromises);

    // Đưa các URL ảnh vào `req.body` để chuyển sang controller
    req.body.imageUrl = imageUrls;

    // Continue with the rest of your code
    next();
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).send("Image upload failed");
  }
};
