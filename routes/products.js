var express      = require("express"),
    Product      = require("../models/product"),
    User         = require("../models/user"),
    cats         = require("../models/cats.json").list,
    path         = require("path"),
    router       = express.Router(),
    middleware   = require("../middleware/index.js");
var countries = require("../models/countries.json").list;
var cities = require("../models/cities/KZ.json").list;
var help = require("./help");
var bazars = require("../models/bazars.json").list;

//==========================APP ROUTES=========================//

//Index Route
router.get("/", function(req, res) {
        
    Product.find({}).sort({created: -1}).exec(function(err, allProducts){
        if(err) console.log(err);
        
        var formquery = {};
        
        if(req.session.search)
            formquery = req.session.search;
        
        res.render("product/index", {products: allProducts, countries: countries, 
            cities: cities, q: formquery, bazars: bazars});
    });
});

//NEW PRODUCT FORM
router.get("/new", middleware.isLoggedIn, function(req, res) {
    
    if(!req.session.fc)
        req.session.fc = {photos: []};
        
    res.render("product/new", {fc: req.session.fc, cats: cats, folder: middleware.folder});
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
            age: req.body.age,
            boobs: req.body.boobs,
            height: req.body.height,
            weight: req.body.weight,
            author: {
                id: req.user._id,
                username: req.user.username
            }
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
            return res.redirect("/products/new");
        }
        
        if(!post.name || post.name.length < 3 ) {
            req.flash("error", "Введите имя!");
            return res.redirect("/products/new");
        }
        
        if(!post.desc || post.desc.length < 10){
            req.flash("error", "Описание должно быть не короче 10 символов!");
            return res.redirect("/products/new");
        }
        
        if(!post.age){
            req.flash("error", "Введите возраст!");
            return res.redirect("/products/new");
        }
        
        if(!post.boobs){
            req.flash("error", "Введите размер груди!");
            return res.redirect("/products/new");
        }
        
        if(!post.height){
            req.flash("error", "Введите рост!");
            return res.redirect("/products/new");
        }
        
        if(!post.weight){
            req.flash("error", "Введите вес!");
            return res.redirect("/products/new");
        }
        
        var newProduct = {
            name: post.name,
            image: post.photos,
            desc: post.desc,
            age: post.age,
            boobs: post.boobs,
            height: post.height,
            weight: post.weight,
            author: post.author,
            created: help.toLocalTime(new Date())
        };
        Product.create(newProduct, function(err, newlyCreated){
            if(err){
                console.log(err);
            } else {
                req.session.fc = {photos: []};
                res.redirect("/myproducts");
            }
        });
});

//EDIT PRODUCT ROUTE
router.get("/:id/edit", middleware.isLoggedIn, function(req, res){
    Product.findById(req.params.id, function(err, foundProduct){
            if(err){
                req.flash("error", err.message);
                res.redirect("back");
            }else{
                console.log(foundProduct);
                res.render("product/edit", {product: foundProduct, cats: cats, folder: middleware.folder});
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
            age: req.body.age,
            boobs: req.body.boobs,
            height: req.body.height,
            weight: req.body.weight,
            author: {
                id: req.user._id,
                username: req.user.username
            }
        };
        
        if(req.body.firstfile) post.photos.push(req.body.firstfile);
        if(req.body.secondfile) post.photos.push(req.body.secondfile);
        if(req.body.thirdfile) post.photos.push(req.body.thirdfile);
        if(req.body.fourthfile) post.photos.push(req.body.fourthfile);
        if(req.body.fifthfile) post.photos.push(req.body.fifthfile);
        if(req.body.sixthfile) post.photos.push(req.body.sixthfile);
        
        if(post.photos.length == 0) {
            req.flash("error", "Добавьте хоть одну фотографию!");
            return res.redirect("/products/new");
        }
        
        if(!post.name || post.name.length < 3 ) {
            req.flash("error", "Введите имя товара!");
            return res.redirect("back");
        }
        
        if(!post.desc || post.desc.length < 10){
            req.flash("error", "Описание должно быть не короче 10 символов!");
            return res.redirect("/products/new");
        }
        
        if(!post.age){
            req.flash("error", "Введите возраст!");
            return res.redirect("/products/new");
        }
        
        if(!post.boobs){
            req.flash("error", "Введите размер груди!");
            return res.redirect("/products/new");
        }
        
        if(!post.height){
            req.flash("error", "Введите рост!");
            return res.redirect("/products/new");
        }
        
        if(!post.weight){
            req.flash("error", "Введите вес!");
            return res.redirect("/products/new");
        }
    
        var newProduct = {
            name: post.name,
            image: post.photos,
            desc: post.desc,
            author: post.author,
            weight: post.weight,
            height: post.height,
            boobs: post.boobs,
            age: post.boobs
        };
        Product.findByIdAndUpdate(post.id, newProduct, function(err, justUpdated){
            if(err){
                console.log(err);
            } else {
                console.log(justUpdated);
                return res.redirect("/myproducts");
            }
        });
});

//DESTROY PRODUCT ROUTE
router.delete("/:id", middleware.isLoggedIn, function(req, res){
    Product.findByIdAndRemove(req.params.id, function(err){
        if(err){
            req.flash("error", err.message);
            res.redirect("/myproducts");
        }else{
            req.flash("success", "Вы только что удалили мастера!");
            res.redirect("/myproducts");
        }
    });
});

module.exports = router;