var express      = require("express"),
    Product      = require("../models/product"),
    cats         = require("../models/cats.json").list,
    crypto       = require("crypto"),
    multer       = require('multer'),
    path         = require("path"),
    router       = express.Router(),
    middleware   = require("../middleware/index.js");
    
const storage = multer.diskStorage({
  destination: './public/uploads',
  filename: function (req, file, callback) {
    crypto.pseudoRandomBytes(16, function(err, raw) {
      if (err) return callback(err);
    
      callback(null, raw.toString('hex') + path.extname(file.originalname));
    });
  }
});

var upload = multer({ storage: storage, limits: { fileSize: 1 * 1000 * 5000 }}).fields([
        { name: 'firstfile'},
        { name: 'secondfile' },
        { name: 'thirdfile' },
        { name: 'fourthfile' },
        { name: 'fifthfile' },
        { name: 'sixthfile' },
        { name: 'seventhfile' }
    ]);

//==========================APP ROUTES=========================//

//Index Route
router.get("/", function(req, res) {
    Product.find({}, function(err, allProducts){
        if(err){
            console.log(err);
        }else{
            res.render("product/index", {products: allProducts});
        }
    });
});

//NEW PRODUCT FORM
router.get("/new", middleware.isLoggedIn, function(req, res) {
    
    if(!req.session.fc)
        req.session.fc = {};
        
    res.render("product/new", {fc: req.session.fc, cats: cats});
});

//POST NEW PRODUCT INTO DB
router.post("/", middleware.isLoggedIn, function(req, res) {
    upload(req, res, function (err) {
        
        var post = {
            name: req.body.name,
            cat: req.body.cat,
            subcat: req.body.subcat,
            price: req.body.price,
            desc: req.body.desc,
            author: {
                id: req.user._id,
                username: req.user.username
            }
        };
        
        req.session.fc = post;
        console.log(req.session.fc);
        
        if(!post.name || post.name.length < 3 ) {
            req.flash("error", "Введите имя товара!");
            return res.redirect("/products/new");
        }
        
        if(post.cat == "Категория товара"){
            req.flash("error", "Выберите категорию товара!");
            return res.redirect("/products/new");
        }
        
        if(post.subcat == "Подкатегория товара"){
            req.flash("error", "Выберите подкатегорию товара!");
            return res.redirect("/products/new");
        }
        
        if(!req.files) {
            req.flash("error", "Добавьте хоть одну фотографию!");
            return res.redirect("/products/new");
        }
    
        if (err) {
            if(err.code == "LIMIT_FILE_SIZE"){
                req.flash("error", "Размер фотографии не должен превышать 5МБ!");
                return res.redirect("/products/new");
            } else {
                req.flash("error", err);
                return res.redirect("/products/new");
            }
        }
        
        if(!post.desc || post.desc.length < 10){
            req.flash("error", "Описание должно быть не короче 10 символов!");
            return res.redirect("/products/new");
        }
        
        if(!post.price || post.price == "0") {
            req.flash("error", "Введите цену!");
            return res.redirect("/products/new");
        }
     
        var images = [];
    
        if(req.files.firstfile) images.push(req.files.firstfile[0].path.replace("public/",""));
        if(req.files.secondfile) images.push(req.files.secondfile[0].path.replace("public/",""));
        if(req.files.thirdfile) images.push(req.files.thirdfile[0].path.replace("public/",""));
        if(req.files.fourthfile) images.push(req.files.fourthfile[0].path.replace("public/",""));
        if(req.files.fifthfile) images.push(req.files.fifthfile[0].path.replace("public/",""));
        if(req.files.sixthfile) images.push(req.files.sixthfile[0].path.replace("public/","")); 
        if(req.files.seventhfile) images.push(req.files.seventhfile[0].path.replace("public/","")); 
    
        console.log(images);
        
        var newProduct = {name: post.name, image: images, cat: post.cat, subcat: post.subcat, desc: post.desc, author: post.author, price: post.price};
        Product.create(newProduct, function(err, newlyCreated){
            if(err){
                console.log(err);
            } else {
                req.session.fc = {};
                res.redirect("/products");
            }
        });
    });
});

//PRODUCT SHOWPAGE MOREEE
router.get("/:id",function(req, res){
    Product.findById(req.params.id).populate("author.id").exec(function(err, foundProduct){
        if(err){
            console.log(err);
        }else{
            if(foundProduct) {
                var mapq = foundProduct.author.id.city + ", " + foundProduct.author.id.address;
                mapq.replace(" ","%20");
                res.render("product/show", {product: foundProduct, mapq: mapq, cats: cats});
            } else {
                res.send("404.");
            }
        }
    });
});

//EDIT PRODUCT ROUTE
router.get("/:id/edit", middleware.checkProductOwnership, function(req, res){
    Product.findById(req.params.id, function(err, foundProduct){
            if(err){
                req.flash("error", err.message);
                res.redirect("back");
            }else{
                res.render("product/edit", {product: foundProduct, cats: cats});
            }
        });
});

//UPDATE PRODUCT ROUTE
router.put("/:id", middleware.checkProductOwnership, function(req, res){
    upload(req, res, function (err) {
        
        var post = {
            id: req.body.id,
            name: req.body.name,
            cat: req.body.cat,
            subcat: req.body.subcat,
            price: req.body.price,
            desc: req.body.desc,
            author: {
                id: req.user._id,
                username: req.user.username
            }
        };
        
        req.session.fc = post;
        
        if(!post.name || post.name.length < 3 ) {
            req.flash("error", "Введите имя товара!");
            return res.redirect("back");
        }
        
        if(post.cat == "Категория товара"){
            req.flash("error", "Выберите категорию товара!");
            return res.redirect("back");
        }
        
        if(post.subcat == "Подкатегория товара"){
            req.flash("error", "Выберите подкатегорию товара!");
            return res.redirect("back");
        }
        
        if(!req.files) {
            req.flash("error", "Добавьте хоть одну фотографию!");
            return res.redirect("back");
        }
    
        if (err) {
            if(err.code == "LIMIT_FILE_SIZE"){
                req.flash("error", "Размер фотографии не должен превышать 5МБ!");
                return res.redirect("back");
            } else {
                req.flash("error", err);
                return res.redirect("back");
            }
        }
        
        if(!post.desc || post.desc.length < 10){
            req.flash("error", "Описание должно быть не короче 10 символов!");
            return res.redirect("back");
        }
        
        if(!post.price || post.price == "0") {
            req.flash("error", "Введите цену!");
            return res.redirect("back");
        }
     
        var images = [];
    
        if(req.files.firstfile) images.push(req.files.firstfile[0].path.replace("public/",""));
        if(req.files.secondfile) images.push(req.files.secondfile[0].path.replace("public/",""));
        if(req.files.thirdfile) images.push(req.files.thirdfile[0].path.replace("public/",""));
        if(req.files.fourthfile) images.push(req.files.fourthfile[0].path.replace("public/",""));
        if(req.files.fifthfile) images.push(req.files.fifthfile[0].path.replace("public/",""));
        if(req.files.sixthfile) images.push(req.files.sixthfile[0].path.replace("public/","")); 
        if(req.files.seventhfile) images.push(req.files.seventhfile[0].path.replace("public/","")); 
    
        var newProduct = {name: post.name, image: images, cat: post.cat, subcat: post.subcat, desc: post.desc, author: post.author, price: post.price};
        Product.findByIdAndUpdate(post.id, newProduct, function(err, newlyCreated){
            if(err){
                console.log(err);
            } else {
                req.session.fc = {};
                console.log(newlyCreated);
                return res.redirect("/products");
            }
        });
    });
});

//DESTROY PRODUCT ROUTE
router.delete("/:id", middleware.checkProductOwnership, function(req, res){
    Product.findByIdAndRemove(req.params.id, function(err){
        if(err){
            req.flash("error", err.message);
            res.redirect("/products");
        }else{
            req.flash("success", "Вы только что удалили товар!");
            res.redirect("/products");
        }
    });
});

module.exports = router;