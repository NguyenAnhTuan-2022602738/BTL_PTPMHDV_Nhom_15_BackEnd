// const streamifier = require("streamifier");
// const cloudinary = require("cloudinary").v2;
// // cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.CLOUD_KEY,
//   api_secret: process.env.CLOUD_SECRET, // Click 'View API Keys' above to copy your API secret
// });
// //End cloudinary

// module.exports.upload = async (req, res, next) => {
//   let streamUpload = (file) => {
//     return new Promise((resolve, reject) => {
//       let stream = cloudinary.uploader.upload_stream((error, result) => {
//         if (result) {
//           resolve(result.url);
//         } else {
//           reject(error);
//         }
//       });
//       streamifier.createReadStream(file.buffer).pipe(stream);
//     });
//   };

//   try {
//     // Process each file and upload to Cloudinary
//     const uploadPromises = req.files.map((file) => streamUpload(file));
//     const imageUrls = await Promise.all(uploadPromises);

//     // Đưa các URL ảnh vào `req.body` để chuyển sang controller
//     req.body.imageUrl = imageUrls;

//     // Continue with the rest of your code
//     next();
//   } catch (error) {
//     console.error("Upload error:", error);
//     res.status(500).send("Image upload failed");
//   }
// };
const streamifier = require("streamifier");
const cloudinary = require("cloudinary").v2;

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

module.exports.upload = async (req, res, next) => {
  // Kiểm tra xem có file không
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("Không có hình ảnh nào được tải lên");
  }

  let streamUpload = (file) => {
    return new Promise((resolve, reject) => {
      let stream = cloudinary.uploader.upload_stream((error, result) => {
        if (result) {
          resolve(result.secure_url); // Trả lại URL an toàn
        } else {
          reject(error);
        }
      });
      // Tạo stream từ file buffer và pipe vào Cloudinary
      streamifier.createReadStream(file.buffer).pipe(stream);
    });
  };

  try {
    // Xử lý từng file và tải lên Cloudinary
    const uploadPromises = req.files.map((file) => streamUpload(file));
    const imageUrls = await Promise.all(uploadPromises);

    // Đưa URL hình vào `req.body.imageUrl` để chuyển đến controller
    req.body.imageUrl = imageUrls; 

    // Tiếp tục với mã khác trong controller
    next();
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).send("Tải hình ảnh thất bại");
  }
};
