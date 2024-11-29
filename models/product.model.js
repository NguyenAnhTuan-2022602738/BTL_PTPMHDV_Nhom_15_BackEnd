const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);

const Car_itemsSchema = new mongoose.Schema(
    {
        name: String,
        name_link: String,
        description: String,
        brand: String,
        version: String,
        vehicle_segment: String,
        engine: String,
        price: String,
        imageUrl: Array,
        paramater_links: String,
        slug: {
            type: String,
            slug: ["name","version"],
            unique: true
        },
        deleted: {
            type: Boolean,
            default: false
        },
        deletedAt: Date,
        clickCount: { type: Number, default: 0 },

         // Thông số kỹ thuật
         //Động cơ/hộp số
         kieuDongCo: String,
         dungTich: String,
         congSuat: String,
         momenXoan: String,
         hopso: String,
         heDanDong: String,
         loaiNhienLieu: String,
         mucTieuThuNhienLieu: String,
         
         // Kích thước/Trọng lượng
         soCho: String,
         kichThuoc: String,
         chieuDaiCoSo: String,
         khoangSangGam: String,
         banKinhVongQuay: String,
         theTichKhoangHanhLy: String,
         dungTichBinhNhienLieu: String,
         trongLuongBanThan: String,
         trongLuongToanTai: String,
         lop_lazang: String,
 
         // Hệ thống treo/phanh
         treoTruoc: String,
         treoSau: String,
         phanhTruoc: String,
         phanhSau: String,
 
         // Ngoại thất
         denPhanhTrenCao: String,
         guongChieuHau: String,
         sayGuongChieuHau: String,
         gatMuaTuDong: String,
         denChieuXa: String,
         denChieuGan: String,
         denBanNgay: String,
         denPhaTuDongBat_Tat: String,
         denPhaTuDongXa_Gan: String,
         denPhaTuDongDieuChinhGocChieu: String,
         denHau: String,
         angTenVayCa: String,
         copDong_MoDien: String,
         moCopRanhTay: String,
 
         // Nội thất
         chatLieuBocGhe: String,
         dieuChinhGheLai: String,
         nhoViTriGheLai: String,
         massageGheLai: String,
         dieuChinhGhePhu: String,
         massageGhePhu: String,
         thongGioGheLai: String,
         thongGioGhePhu: String,
         suoiAmGheLai: String,
         suoiAmGhePhu: String,
         bangDongHoTaiXe: String,
         nutBamTichHopTrenVolang: String,
         chatLieuBocVoLang: String,
         chiaKhoaThongMinh: String,
         khoiDongNutBam: String,
         dieuHoa: String,
         cuaGioHangGheSau: String,
         cuaKinhMotCham: String,
         cuaSoTroi: String,
         cuaSoTroiToanCanh: String,
         guongChieuHauTrongXeChongChoiTuDong: String,
         tuaTayHangGheTruoc: String,
         tuaTayHangGheSau: String,
         manHinhGiaiTri: String,
         ketNoiAppleCarPlay: String,
         ketNoiAndroidAuto: String,
         raLenhGiongNoi: String,
         damThoaiRanhTay: String,
         heThongLoa: String,
         phatWifi: String,
         ketNoiAUX: String,
         ketNoiUSB: String,
         ketNoiBluetooth: String,
         radioAM_FM: String,
         sacKhongDay: String,
 
         // Hỗ trợ vận hành
         troLucVoLang: String,
         nhieuCheDoLai: String,
         layChuyenSoTrenVoLang: String,
         kiemSoatGiaToc: String,
         phanhTayDienTu: String,
         giuPhanhTuDong: String,
 
         // Công nghệ an toàn
         kiemSoatHanhTrinh: String,
         kiemSoatHanhTrinhThichUng: String,
         canhBaoPhuongTienCatNgangKhiLui: String,
         canhBaoTaiXeBuonNgu: String,
         mocGheAnToanChoTreEmIsofix: String,
         hoTroDoDeo: String,
         canhBaoDiemMu: String,
         camBienLui: String,
         cameraLui: String,
         camera360: String,
         cameraQuanSatLanDuong: String,
         canhBaoChechLanDuong: String,
         hoTroGiuLan: String,
         hoTroPhanhTuDongGiamThieuVaCham: String,
         phanPhoiLucPhanhDienTu: String,
         canBangDienTu: String,
         kiemSoatLucKeo: String,
         hoTroKhoiHanhNgangDoc: String,
         soTuiKhi: String,
         chongBoCungPhanh: String,
         hoTroLucPhanhKhanCap: String
    },
    {
        timestamps: true
    }
);


const Car_items = mongoose.model('Car_items', Car_itemsSchema, "Car_items");

module.exports = Car_items;