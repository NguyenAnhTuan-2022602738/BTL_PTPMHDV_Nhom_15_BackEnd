const md5 = require("md5");
const User = require("../../models/user.model");
const generateHelper = require("../../helpers/generate");
const sendMailHelper = require("../../helpers/sendMail");
const ForgotPassword = require("../../models/forgot-password.model");

//[POST] /api/users/register
module.exports.register = async (req, res) => {
  req.body.password = md5(req.body.password);

  const existEmail = await User.findOne({
    email: req.body.email,
    deleted: false,
  });

  if (existEmail) {
    res.json({
      code: 500,
      message: "Email đã tồn tại",
    });
  } else {
    const user = new User({
      fullname: req.body.fullname,
      email: req.body.email,
      password: req.body.password,
    });

    user.save();

    const token = user.token;

    res.cookie("token", token);

    res.json({
      code: 200,
      message: "Đăng ký thành công!",
      token: token,
    });
  }
};

//[POST] /api/users/login
module.exports.login = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne({
    email: email,
    deleted: false,
  });

  if (!user) {
    res.json({
      code: 500,
      message: "Email không tồn tại!",
    });
    return;
  }

  if (md5(password) !== user.password) {
    res.json({
      code: 500,
      message: "Sai mật khẩu!",
    });
    return;
  }

  const token = user.token;

  res.cookie("token", token);

  res.json({
    code: 200,
    message: "Đăng nhập thành công!",
    token: token,
  });
};

// [POST] /api/users/password/forgot
module.exports.forgotPassword = async (req, res) => {
  const email = req.body.email;

  // Find user by email
  const user = await User.findOne({
    email: email,
    deleted: false,
  });

  if (!user) {
    return res.status(404).json({
      code: 500,
      message: "Email không tồn tại!",
    });
  }

  // Generate OTP
  const otp = generateHelper.generateRandomNumber(8);
  
  // OTP Expiry time in milliseconds (3 minutes)
  const timeExpire = 3 * 60 * 1000;  // Convert to milliseconds

  // Save OTP data in database
  const objectForgotPassword = {
    email: email,
    otp: otp,
    expireAt: Date.now() + timeExpire, // Set expiry time for OTP
  };

  const forgotPassword = new ForgotPassword(objectForgotPassword);

  try {
    await forgotPassword.save();  // Save OTP record

    // Prepare the email content
    const subject = "Mã OTP xác minh lấy lại mật khẩu";
    const html = `
      Mã OTP để lấy lại mật khẩu của bạn là  <b>${otp}</b> (Sử dụng trong 3 phút).
      Vui lòng không chia sẻ mã OTP này với bất kỳ ai.
    `;

    // Send OTP via email
    await sendMailHelper.sendMail(email, subject, html);
    
    // Respond with success message
    return res.status(200).json({
      code: 200,
      message: "Đã gửi mã OTP qua email",
    });
  } catch (error) {
    console.error('Error while sending OTP email:', error);

    // Handle errors during OTP generation or email sending
    return res.status(500).json({
      code: 500,
      message: 'Không thể gửi mã OTP. Vui lòng thử lại sau!',
    });
  }
};

//[POST] /api/users/password/otp
module.exports.otpPassword = async (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;

  const result = await ForgotPassword.findOne({
    email: email,
    otp: otp,
  });

  if (!result) {
    res.json({
      code: 500,
      message: "Mã OTP không hợp lệ",
    });
  }

  const user = await User.findOne({
    email: email,
  });
  const token = user.token;

  res.cookie("token", token);

  res.json({
    code: 200,
    message: "Xác thực thành công",
    token: token,
  });
};

//[POST] /api/users/password/reset
module.exports.resetPassword = async (req, res) => {
  const token = req.body.token;
  const password = req.body.password;

  const user = await User.findOne({
    token: token,
  });

  if (md5(password) === user.password) {
    res.json({
      code: 500,
      message: "Vui lòng nhập mật khẩu mới khác mật khẩu cũ.",
    });
    return;
  }

  await User.updateOne(
    {
        token: token,
    },
    {
        password: md5(password),
    }
  );

  res.json({
    code: 200,
    message: "Đổi mật khẩu thành công",
  });
};
