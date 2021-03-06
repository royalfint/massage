var express      = require("express"),
    Product      = require("../models/product"),
    User         = require("../models/user"),
    Deal       = require("../models/deal"),
    cats         = require("../models/cats.json").list,
    path         = require("path"),
    router       = express.Router(),
    middleware   = require("../middleware/index.js");
var help = require("./help");

//==========================APP ROUTES=========================//

//NEW PRODUCT FORM
router.get("/new", middleware.isLoggedIn, function(req, res) {
    
    if(!req.session.fc)
        req.session.fc = {photos: []};
        
    res.render("deals/new", {fc: req.session.fc, cats: cats, folder: middleware.folder});
});

router.get("/clear", middleware.isLoggedIn, function(req, res) {
    req.session.fc = {photos: []};
    res.redirect("/admin");
});

//POST NEW PRODUCT INTO DB
router.post("/", middleware.isLoggedIn, function(req, res) {
        var post = {
            name: req.body.name,
            photos: [],
            desc: req.body.desc,
        };
        
        req.session.fc = post;
        
        if(req.body.firstfile) post.photos.push(req.body.firstfile);
        if(req.body.secondfile) post.photos.push(req.body.secondfile);
        if(req.body.thirdfile) post.photos.push(req.body.thirdfile);
        if(req.body.fourthfile) post.photos.push(req.body.fourthfile);
        if(req.body.fifthfile) post.photos.push(req.body.fifthfile);
        if(req.body.sixthfile) post.photos.push(req.body.sixthfile);
        
        if(post.photos.length == 0) {
            req.flash("error", "Добавьте хоть одну фотографию!");
            return res.redirect("/deals/new");
        }
        
        if(!post.name || post.name.length < 3 ) {
            req.flash("error", "Введите имя!");
            return res.redirect("/deals/new");
        }
        
        if(!post.desc || post.desc.length < 10){
            req.flash("error", "Описание должно быть не короче 10 символов!");
            return res.redirect("/deals/new");
        }
        
        var newProduct = {
            name: post.name,
            image: post.photos,
            desc: post.desc,
        };
        Deal.create(newProduct, function(err, newlyCreated){
            if(err){
                console.log(err);
            } else {
                req.session.fc = {photos: []};
                res.redirect("/mydeals");
            }
        });
});

//EDIT PRODUCT ROUTE
router.get("/:id/edit", middleware.isLoggedIn, function(req, res){
    Deal.findById(req.params.id, function(err, foundProduct){
            if(err){
                req.flash("error", err.message);
                res.redirect("back");
            }else{
                console.log(foundProduct);
                res.render("deals/edit", {product: foundProduct, cats: cats, folder: middleware.folder});
            }
        });
});

//UPDATE PRODUCT ROUTE
router.put("/:id", middleware.isLoggedIn, function(req, res){
        var post = {
            id: req.params.id,
            name: req.body.name,
            photos: [],
            desc: req.body.desc,
        };
        
        if(req.body.firstfile) post.photos.push(req.body.firstfile);
        if(req.body.secondfile) post.photos.push(req.body.secondfile);
        if(req.body.thirdfile) post.photos.push(req.body.thirdfile);
        if(req.body.fourthfile) post.photos.push(req.body.fourthfile);
        if(req.body.fifthfile) post.photos.push(req.body.fifthfile);
        if(req.body.sixthfile) post.photos.push(req.body.sixthfile);
        
        if(post.photos.length == 0) {
            req.flash("error", "Добавьте хоть одну фотографию!");
            return res.redirect("back");
        }
        
        if(!post.name || post.name.length < 3 ) {
            req.flash("error", "Введите имя товара!");
            return res.redirect("back");
        }
        
        if(!post.desc || post.desc.length < 10){
            req.flash("error", "Описание должно быть не короче 10 символов!");
            return res.redirect("back");
        }
        
        var newProduct = {
            name: post.name,
            image: post.photos,
            desc: post.desc,
        };
        Deal.findByIdAndUpdate(post.id, newProduct, function(err, justUpdated){
            if(err){
                console.log(err);
            } else {
                console.log(justUpdated);
                return res.redirect("/mydeals");
            }
        });
});

//DESTROY PRODUCT ROUTE
router.delete("/:id", middleware.isLoggedIn, function(req, res){
    Product.findByIdAndRemove(req.params.id, function(err){
        if(err){
            req.flash("error", err.message);
            res.redirect("/mydeals");
        }else{
            req.flash("success", "Вы только что удалили акцию!");
            res.redirect("/mydeals");
        }
    });
});

module.exports = router;