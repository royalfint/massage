var express     = require("express"),
    User  = require("../models/user"),
    passport  = require("passport"),
    Product  = require("../models/product");
var router = express.Router();
var middleware = require("../middleware/index.js");
var countries = require("../models/countries.json").list;
var cities = require("../models/cities/KZ.json").list;

router.get("/", function(req, res) {
    res.redirect("/products");
});

//=========================AUTH ROUTES===========================//

//show sign up form
router.get("/register", function(req, res){
    if(!req.session.rf)
        req.session.rf = {};
        
    res.render("register", {countries: countries, cities: cities, rf: req.session.rf});
});

//sign up
router.post("/register", function(req, res){
    var post = {
        username: req.body.username.trim(),
        password: req.body.password.trim(),
        phone:    req.body.phone.trim(),
        address:  req.body.address.trim(),
        website:  req.body.website.trim(),
        title:    req.body.title.trim(),
        country:  req.body.country.trim(),
        city:     req.body.city.trim(),
        desc:     req.body.desc.trim()
    };
    
    req.session.rf = post;
        
    if(!post.username || !post.username.match(/^[a-zA-Z0-9]+$/) || post.username.length < 3 || post.username.length > 20) {
        req.flash("error", "Логин должен быть на латинице от 3 до 20 символов!");
        return res.redirect("/register");
    }
    
    if(!post.password || !post.password.match(/^[a-zA-Z0-9]+$/) || post.password.length < 6 || post.password.length > 30) {
        req.flash("error", "Пароль должен быть на латинице от 6 до 30 символов!");
        return res.redirect("/register");
    }
    
    if(!post.phone || !post.phone.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)) {
        req.flash("error", "Телефон должен быть указан в формате +77001234567");
        return res.redirect("/register");
    }
    
    if(!post.address || post.address.length < 8){
        req.flash("error", "Введите адрес!");
        return res.redirect("/register");
    }
    
    if(post.website && !post.website.match(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi)){
        req.flash("error", "Ссылка на сайт должны быть в формате www.google.com");
        return res.redirect("/register");
    }
    
    if(!post.desc || post.desc.length < 10){
        req.flash("error", "Описание должно быть не короче 10 символов!");
        return res.redirect("/register");
    }
    
    if(!post.title || post.title.length < 1){
        req.flash("error", "Введите название точки!");
        return res.redirect("/register");
    }
    
    var newUser = new User({username: post.username});
    User.register(newUser, post.password, function(err, user){
        if(err){
            return res.redirect("/register");
        }
        user.phone = post.phone;
        user.address = post.address;
        user.website = post.website;
        user.country = post.country;
        user.desc = post.desc;
        user.city = post.city;
        user.save();
        passport.authenticate("local")(req, res, function(){
            req.session.rf = {};
            req.flash("success", "Добро пожаловать в Bazarlar, " + user.username + "!");
            res.redirect("/admin");
        });
    });
});

//show login form
router.get("/login", function(req, res){
    res.render("login");
});

//login
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/products",
        failureFlash: 'Неправльный логин или пароль!',
        successFlash: 'Добро пожаловать в Bazarlar!',
        failureRedirect: "/login"
    }), function(req, res){
});

//logout route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Выход из системы!");
    res.redirect("/products");
});

///admin
router.get("/admin", middleware.isLoggedIn, function(req, res) {
    var seller = req.user.username;
    User.findOne({username: seller}, function(err, foundSeller) {
       if(err) console.log(err); 
       
        Product.find({'author.username': seller}).populate("author.id").exec(function(err, foundProducts){
            if(err){
                console.log(err);
            }else{
                res.render("panel/admin", {products: foundProducts, author: foundSeller});
            }
        });
    });
});

router.get("/seller/:username", function(req, res) {
    var seller = req.params.username;
    User.findOne({username: seller}, function(err, foundSeller) {
       if(err) console.log(err); 
       
        Product.find({'author.username': seller}).populate("author.id").exec(function(err, foundProducts){
            if(err){
                console.log(err);
            }else{
                res.render("seller", {products: foundProducts, author: foundSeller});
            }
        });
    });
});

router.post("/search", function(req, res) {
    Product.find({ "name": { "$regex": req.body.query, "$options": "i" }}, function(err, allProducts){
        if(err){
            console.log(err);
        }else{
            res.render("product/index", {products: allProducts});
        }
    });
});

module.exports = router;