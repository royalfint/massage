var express     = require("express"),
    User  = require("../models/user"),
    passport  = require("passport"),
    Product  = require("../models/product");
var router = express.Router();
var middleware = require("../middleware/index.js");

router.get("/", function(req, res) {
    res.redirect("/products");
});

//=========================AUTH ROUTES===========================//

//show sign up form
router.get("/register", function(req, res){
    res.render("register");
});

//sign up
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            return res.render("register", {"error": err.message});
        }
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

module.exports = router;