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
    res.render("register", {countries: countries, cities: cities});
});

//sign up
router.post("/register", function(req, res){
    var phone    = req.body.phone,
        address  = req.body.address,
        website  = req.body.website,
        country  = req.body.country,
        city     = req.body.city,
        desc     = req.body.desc;
    
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            return res.render("register", {"error": err.message});
        }
        user.phone = phone;
        user.address = address;
        user.website = website;
        user.country = country;
        user.desc = desc;
        user.city = city;
        user.save();
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to Bazarlar, " + user.username + "!");
            res.redirect("/products");
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
        failureFlash: 'Invalid username or password.',
        successFlash: 'Welcome to Bazarlar!',
        failureRedirect: "/login"
    }), function(req, res){
});

//logout route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/products");
});

///admin
router.get("/admin", middleware.isLoggedIn, function(req, res) {
   res.render("panel/admin");
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

module.exports = router;