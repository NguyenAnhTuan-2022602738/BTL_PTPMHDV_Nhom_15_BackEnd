const Car_items = require("../../models/product.model");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const systemConfig = require("../../config/system");
const fs = require("fs");

//[GET] /admin/car_items
module.exports.index = async (req, res) => {
  let find = {
    deleted: false,
  };

  //Tối ưu tìm kiếm
  const objectSearch = searchHelper(req.query);

  if (objectSearch.regex) {
    find.brand = objectSearch.regex;
  }
  //End Tối ưu tìm kiếm

  //pagination
  const countCars = await Car_items.countDocuments(find);

  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 10,
    },
    req.query,
    countCars
  );
  //end pagination

  const cars = await Car_items.find(find)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

  res.render("admin/pages/products/index", {
    pageTitle: "Danh sách xe",
    Car_items: cars,
    keyword: objectSearch.keyword,
    pagination: objectPagination,
  });
};

//[DELETE] /admin/products/delete/:id
module.exports.deleteItem = async (req, res) => {
  const id = req.params.id;
  try {
    //await Car_items.deleteOne({ _id: id});
    await Car_items.updateOne(
      { _id: id },
      { deleted: true, deletedAt: new Date() }
    );
    req.flash("success", "Xóa xe thành công!");
    res.redirect("back"); // Chuyển hướng đến trang danh sách sau khi xóa
  } catch (error) {
    console.error(error);
    res.status(500).send("Có lỗi xảy ra khi xóa sản phẩm");
  }
};

//[PATCH] /admin/car_items/change-multi
module.exports.changeMulti = async (req, res) => {
  const type = req.body.type;
  const ids = req.body.ids.split(", ");

  switch (type) {
    case "delete-multi":
      await Car_items.updateMany(
        { _id: { $in: ids } },
        { deleted: true, deletedAt: new Date() }
      );
      req.flash("success", `Xóa thành công ${ids.length} xe!`);
      break;
    default:
      break;
  }

  res.redirect("back");
};

//[GET] /admin/car_items/create
module.exports.create = async (req, res) => {
  res.render("admin/pages/products/create", {
    pageTitle: "Thêm mới xe",
  });
};

//[POST] /admin/car_items/create
module.exports.createPost = async (req, res) => {
  const formData = {};

  for (const key in req.body) {
    if (key.endsWith("_checked")) {
      const baseKey = key.replace("_checked", "");
      const textValue = req.body[baseKey]?.trim() || "";
      const isChecked = req.body[key] === "on";

      // Save text if present, otherwise save 'true' or 'false' based on checkbox
      formData[baseKey] = textValue ? textValue : isChecked ? "true" : "false";
    } else if (!formData.hasOwnProperty(key)) {
      formData[key] =
        typeof req.body[key] === "string"
          ? req.body[key].trim()
          : "Đang cập nhật";
    }
  }

  try {
    // Kiểm tra trùng lặp version, name và brand
    const existingCar = await Car_items.findOne({
      version: formData.version,
      name: formData.name,
      brand: formData.brand,
    });

    if (existingCar) {
      req.flash("error", "Trùng sản phẩm!");
      res.redirect("back");
      return;
    }

    // Lấy URL ảnh từ `req.body.imageUrl` đã được upload ở route
    formData.imageUrl = req.body.imageUrl || [];

    const car = new Car_items(formData);
    await car.save();
    req.flash("success", `Thêm mới xe thành công!`);

    res.redirect(`${systemConfig.prefixAdmin}/car_items`);
  } catch (error) {
    console.error("Error saving car:", error);
    res.status(500).send("Có lỗi xảy ra trong quá trình lưu dữ liệu.");
  }
};

//[GET] /admin/car_items/edit
module.exports.edit = async (req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id,
    };
    const car = await Car_items.findOne(find);

    res.render("admin/pages/products/edit", {
      pageTitle: "Sửa thông tin xe",
      car: car,
    });
  } catch (error) {
    req.flash("error", "Bạn đã chỉnh sửa id xe không có trong hệ thống!");
    res.redirect(`${systemConfig.prefixAdmin}/car_items`);
  }
};

//[GET] /admin/car_items/detail
module.exports.detail = async (req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id,
    };
    const car = await Car_items.findOne(find);

    res.render("admin/pages/products/detail", {
      pageTitle: car.version,
      car: car,
    });
  } catch (error) {
    req.flash("error", "Bạn đã chỉnh sửa id xe không có trong hệ thống!");
    res.redirect(`${systemConfig.prefixAdmin}/car_items`);
  }
};

// [PATCH] /admin/car_items/edit/:id
module.exports.editPatch = async (req, res) => {
  const formData = {};

  for (const key in req.body) {
    if (key.endsWith("_checked")) {
      const baseKey = key.replace("_checked", "");
      const textValue = req.body[baseKey]?.trim() || "";
      const isChecked = req.body[key] === "on";

      // Lưu giá trị văn bản nếu có, nếu không lưu 'true' hoặc 'false' dựa trên checkbox
      formData[baseKey] = textValue ? textValue : isChecked ? "true" : "false";
    } else if (!formData.hasOwnProperty(key)) {
      formData[key] = req.body[key]?.trim() || "Đang cập nhật";
    }
  }

  try {
    // Lấy ảnh cũ từ cơ sở dữ liệu
    const existingCar = await Car_items.findById(req.params.id);
    if (existingCar) {
      // Lấy các đường dẫn hình ảnh cũ từ car.imageUrl
      const existingImages = existingCar.imageUrl || [];
      formData.imageUrl = existingImages; // Khởi tạo với ảnh cũ

      // Thêm các ảnh mới được tải lên vào mảng `imageUrl`
      const newImages = req.files
        ? req.files.map((file) => `/uploads/${file.filename}`)
        : [];
      formData.imageUrl = [...formData.imageUrl, ...newImages]; // Gộp các ảnh cũ và mới
    } else {
      req.flash("error", "Không tìm thấy xe để chỉnh sửa.");
      return res.redirect("back");
    }

    // Cập nhật thông tin xe trong cơ sở dữ liệu
    await Car_items.updateOne(
      {
        _id: req.params.id,
      },
      formData
    );
    req.flash("success", `Sửa xe thành công!`);
  } catch (error) {
    console.error(error);
    req.flash("error", "Có lỗi xảy ra trong quá trình lưu dữ liệu.");
  }
  res.redirect("back");
};

// [POST] /admin/car_items/import
module.exports.importCarItems = (req, res) => {
  const filePath = req.file.path;

  fs.readFile(filePath, "utf8", async (err, data) => {
    if (err) {
      res.flash("error", "Lỗi đọc file");
      res.redirect("back");
    }

    try {
      const carItems = JSON.parse(data);
      const itemsToInsert = [];

      // Find existing items to avoid duplicates
      const existingItems = await Car_items.find({
        $or: carItems.map((item) => ({
          version: item.version,
          name: item.name,
          brand: item.brand,
        })),
      });

      // Create a Set of existing item identifiers
      const existingItemsSet = new Set(
        existingItems.map(
          (item) => `${item.version}-${item.name}-${item.brand}`
        )
      );

      for (const item of carItems) {
        // Prepare new item with default values for missing fields
        const newItem = {
          name: item.name || "Đang cập nhật",
          name_link: item.name_link || "Đang cập nhật",
          description: item.description || "Đang cập nhật",
          brand: item.brand || "Đang cập nhật",
          version: item.version || "Đang cập nhật",
          vehicle_segment: item.vehicle_segment || "Đang cập nhật",
          engine: item.engine || "Đang cập nhật",
          price: item.price || "Đang cập nhật",
          imageUrl: item.imageUrl || "Đang cập nhật",
          parameter_links: item.parameter_links || "Đang cập nhật",

          // Specifications with default 'Đang cập nhật' value
          kieuDongCo: item.kieuDongCo || "Đang cập nhật",
          dungTich: item.dungTich || "Đang cập nhật",
          congSuat: item.congSuat || "Đang cập nhật",
          momenXoan: item.momenXoan || "Đang cập nhật",
          hopso: item.hopso || "Đang cập nhật",
          heDanDong: item.heDanDong || "Đang cập nhật",
          loaiNhienLieu: item.loaiNhienLieu || "Đang cập nhật",
          mucTieuThuNhienLieu: item.mucTieuThuNhienLieu || "Đang cập nhật",

          soCho: item.soCho || "Đang cập nhật",
          kichThuoc: item.kichThuoc || "Đang cập nhật",
          chieuDaiCoSo: item.chieuDaiCoSo || "Đang cập nhật",
          khoangSangGam: item.khoangSangGam || "Đang cập nhật",
          banKinhVongQuay: item.banKinhVongQuay || "Đang cập nhật",
          theTichKhoangHanhLy: item.theTichKhoangHanhLy || "Đang cập nhật",
          dungTichBinhNhienLieu: item.dungTichBinhNhienLieu || "Đang cập nhật",
          trongLuongBanThan: item.trongLuongBanThan || "Đang cập nhật",
          trongLuongToanTai: item.trongLuongToanTai || "Đang cập nhật",
          lop_lazang: item.lop_lazang || "Đang cập nhật",

          treoTruoc: item.treoTruoc || "Đang cập nhật",
          treoSau: item.treoSau || "Đang cập nhật",
          phanhTruoc: item.phanhTruoc || "Đang cập nhật",
          phanhSau: item.phanhSau || "Đang cập nhật",

          denPhanhTrenCao: item.denPhanhTrenCao || "Đang cập nhật",
          guongChieuHau: item.guongChieuHau || "Đang cập nhật",
          sayGuongChieuHau: item.sayGuongChieuHau || "Đang cập nhật",
          gatMuaTuDong: item.gatMuaTuDong || "Đang cập nhật",
          denChieuXa: item.denChieuXa || "Đang cập nhật",
          denChieuGan: item.denChieuGan || "Đang cập nhật",
          denBanNgay: item.denBanNgay || "Đang cập nhật",
          denPhaTuDongBat_Tat: item.denPhaTuDongBat_Tat || "Đang cập nhật",
          denPhaTuDongXa_Gan: item.denPhaTuDongXa_Gan || "Đang cập nhật",
          denPhaTuDongDieuChinhGocChieu:
            item.denPhaTuDongDieuChinhGocChieu || "Đang cập nhật",
          denHau: item.denHau || "Đang cập nhật",
          angTenVayCa: item.angTenVayCa || "Đang cập nhật",
          copDong_MoDien: item.copDong_MoDien || "Đang cập nhật",
          moCopRanhTay: item.moCopRanhTay || "Đang cập nhật",

          chatLieuBocGhe: item.chatLieuBocGhe || "Đang cập nhật",
          dieuChinhGheLai: item.dieuChinhGheLai || "Đang cập nhật",
          nhoViTriGheLai: item.nhoViTriGheLai || "Đang cập nhật",
          massageGheLai: item.massageGheLai || "Đang cập nhật",
          dieuChinhGhePhu: item.dieuChinhGhePhu || "Đang cập nhật",
          massageGhePhu: item.massageGhePhu || "Đang cập nhật",
          thongGioGheLai: item.thongGioGheLai || "Đang cập nhật",
          thongGioGhePhu: item.thongGioGhePhu || "Đang cập nhật",
          suoiAmGheLai: item.suoiAmGheLai || "Đang cập nhật",
          suoiAmGhePhu: item.suoiAmGhePhu || "Đang cập nhật",
          bangDongHoTaiXe: item.bangDongHoTaiXe || "Đang cập nhật",
          nutBamTichHopTrenVolang:
            item.nutBamTichHopTrenVolang || "Đang cập nhật",
          chatLieuBocVoLang: item.chatLieuBocVoLang || "Đang cập nhật",
          chiaKhoaThongMinh: item.chiaKhoaThongMinh || "Đang cập nhật",
          khoiDongNutBam: item.khoiDongNutBam || "Đang cập nhật",
          dieuHoa: item.dieuHoa || "Đang cập nhật",
          cuaGioHangGheSau: item.cuaGioHangGheSau || "Đang cập nhật",
          cuaKinhMotCham: item.cuaKinhMotCham || "Đang cập nhật",
          cuaSoTroi: item.cuaSoTroi || "Đang cập nhật",
          cuaSoTroiToanCanh: item.cuaSoTroiToanCanh || "Đang cập nhật",
          guongChieuHauTrongXeChongChoiTuDong:
            item.guongChieuHauTrongXeChongChoiTuDong || "Đang cập nhật",
          tuaTayHangGheTruoc: item.tuaTayHangGheTruoc || "Đang cập nhật",
          tuaTayHangGheSau: item.tuaTayHangGheSau || "Đang cập nhật",
          manHinhGiaiTri: item.manHinhGiaiTri || "Đang cập nhật",
          ketNoiAppleCarPlay: item.ketNoiAppleCarPlay || "Đang cập nhật",
          ketNoiAndroidAuto: item.ketNoiAndroidAuto || "Đang cập nhật",
          raLenhGiongNoi: item.raLenhGiongNoi || "Đang cập nhật",
          damThoaiRanhTay: item.damThoaiRanhTay || "Đang cập nhật",
          heThongLoa: item.heThongLoa || "Đang cập nhật",
          phatWifi: item.phatWifi || "Đang cập nhật",
          ketNoiAUX: item.ketNoiAUX || "Đang cập nhật",
          ketNoiUSB: item.ketNoiUSB || "Đang cập nhật",
          ketNoiBluetooth: item.ketNoiBluetooth || "Đang cập nhật",
          radioAM_FM: item.radioAM_FM || "Đang cập nhật",
          sacKhongDay: item.sacKhongDay || "Đang cập nhật",

          troLucVoLang: item.troLucVoLang || "Đang cập nhật",
          nhieuCheDoLai: item.nhieuCheDoLai || "Đang cập nhật",
          layChuyenSoTrenVoLang: item.layChuyenSoTrenVoLang || "Đang cập nhật",
          kiemSoatGiaToc: item.kiemSoatGiaToc || "Đang cập nhật",

          kiemSoatHanhTrinh: item.kiemSoatHanhTrinh || "Đang cập nhật",
          hoTroGiuaLan: item.hoTroGiuaLan || "Đang cập nhật",
          camera360: item.camera360 || "Đang cập nhật",
          cameraLui: item.cameraLui || "Đang cập nhật",
          camBienSau: item.camBienSau || "Đang cập nhật",
          camBienGoc: item.camBienGoc || "Đang cập nhật",
          canhBaoDiemMu: item.canhBaoDiemMu || "Đang cập nhật",
          canhBaoPhuongTienCatNgang:
            item.canhBaoPhuongTienCatNgang || "Đang cập nhật",
          canhBaoApSuatLop: item.canhBaoApSuatLop || "Đang cập nhật",
          heThongChongBoCungPhanh:
            item.heThongChongBoCungPhanh || "Đang cập nhật",
          heThongCanBangDienTu: item.heThongCanBangDienTu || "Đang cập nhật",
          phanhTayDienTu: item.phanhTayDienTu || "Đang cập nhật",
        };

        const itemKey = `${newItem.version}-${newItem.name}-${newItem.brand}`;
        if (!existingItemsSet.has(itemKey)) {
          itemsToInsert.push(newItem);
        } else {
          req.flash(
            "error",
            `Xe ${newItem.name}-${newItem.version} đã tồn tại trong hệ thống!`
          );
          res.redirect(`${systemConfig.prefixAdmin}/car_items/create`);
        }
      }

      if (itemsToInsert.length > 0) {
        const insertedItems = await Car_items.insertMany(itemsToInsert);
        const fisrtItemId = insertedItems[0]._id;
        req.flash("success", "Nhập dữ liệu thành công");
        res.redirect(
          `${systemConfig.prefixAdmin}/car_items/detail/${fisrtItemId}`
        );
        // res.redirect("back");
      }
    } catch (error) {
      console.error("Lỗi xử lý dữ liệu:", error);
      res.flash("error", "Lỗi xử lý dữ liệu");
      res.redirect("back");
    }
  });
};
