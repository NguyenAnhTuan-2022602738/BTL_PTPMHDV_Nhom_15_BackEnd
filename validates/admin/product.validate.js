module.exports.createPost = (req, res, next) => {
    if(!req.body.name){
        req.flash("error", "Vui lòng nhập đủ thông tin!");
        res.redirect("back");
        return;
    }
    next();
}