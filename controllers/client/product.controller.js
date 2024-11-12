//[GET] /car_items

const Car_items = require("../../models/product.model");


//[GET]/car_items
module.exports.index = async (req, res) => {
    const cars = await Car_items.find({
        deleted: false
    });
    

    res.render("client/pages/products/index", {
        pageTitle: "Danh sách xe",
        Car_items: cars
    });
}

//[GET]/car_items/:name-:version
module.exports.detail = async (req, res) => {
    // console.log(req.params.id);

    // res.render("client/pages/products/detail", {
    //     pageTitle: "Chi tiết xe"
    // });
    try{
        const find ={
            deleted: false,
            _id: req.params.id
        }
        const car = await Car_items.findOne(find);
    
        res.render("client/pages/products/detail", {
            pageTitle: car.version,
            car: car
        });
    }catch(error){
        req.flash("error", "Bạn đã xem xe với id không có trong hệ thống!");
        res.redirect(`${systemConfig.prefixClient}/car_items`);
    }
}