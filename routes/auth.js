var express     = require("express"),
    User  = require("../models/user"),
    passport  = require("passport"),
    sgMail   = require("@sendgrid/mail"),
    Product  = require("../models/product"),
    router = express.Router(),
    middleware = require("../middleware/index.js"),
    countries = require("../models/countries.json").list,
    cities = require("../models/cities/KZ.json").list,
    help = require("./help"),
    bazars = require("../models/bazars.json").list;

var api_key = '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';

//sign up
router.post("/register", function(req, res){
    var post = {
        username: req.body.username.trim(),
        email:    req.body.email.trim(),
        password: req.body.password.trim(),
        phone:    req.body.phone.trim(),
        address:  req.body.address.trim(),
        title:    req.body.title.trim(),
        desc:     req.body.desc.trim()
    };
    
    req.session.rf = post;
        
    if(!post.username || !post.username.match(/^[a-zA-Z0-9]+$/) || post.username.length < 3 || post.username.length > 20) {
        req.flash("error", "Логин должен быть на латинице от 3 до 20 символов!");
        return res.redirect("/register");
    }
    
    if(!post.email || !post.email.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)){
        req.flash("error", "Введите правильный E-mail!");
        return res.redirect("back");
    }
    
    if(!post.password || !post.password.match(/^[a-zA-Z0-9]+$/) || post.password.length < 6 || post.password.length > 30) {
        req.flash("error", "Пароль должен быть на латинице от 6 до 30 символов!");
        return res.redirect("/register");
    }
    
    if(!post.phone || !post.phone.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)) {
        req.flash("error", "Телефон должен быть указан в формате +77001234567");
        return res.redirect("/register");
    }
    
    if(!post.address || post.address.length < 4){
        req.flash("error", "Введите адрес!");
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
        if(err) return res.redirect("/register");
        
        user.phone = post.phone;
        user.title = post.title;
        user.address = post.address;
        user.token = String(middleware.folder());
        user.website = post.website;
        user.email = post.email;
        user.desc = post.desc;
        user.rated = [user.username];
        user.rating = 0;
        user.status = 0;
        user.reviews = 0;
        user.balance = 0;
        user.payments = [];
        user.ispaid = false;
        user.active = true;
        user.girlsTitle = "";
        user.girlsSub= "";
        user.serviceTitle ="";
        user.serviceSub= "";
        user.appartsTitle= "";
        user.appartsSub= "";
        user.aboutTitle= "";
        user.aboutSub="";
        user.aboutText="";
        user.dealsTitle="";
        user.dealsSub="";
        user.contactsTitle="";
        user.contactsSub="";
        user.contactsText="";
        user.registered = help.toLocalTime(new Date());
        user.paydate = help.daysToDate(help.toLocalTime(new Date()), 30);
        console.log("registered: ", user.registered);
        console.log("paydate: ", user.paydate);
        user.save(function(err){
            console.log(err);
        });
        console.log("new user: ", user);
        passport.authenticate("local")(req, res, function(){
            req.session.rf = {};
            res.redirect("/myproducts");
        });
    });
});

//show sign up form
router.get("/register", function(req, res){
    if(!req.session.rf)
        req.session.rf = {};
        
    res.render("register", { rf: req.session.rf});
});

//show login form
router.get("/login", function(req, res){
    res.render("login");
});

//login
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/logged",
        failureFlash: 'Неправильный логин или пароль!',
        successFlash: 'Добро пожаловать в Massage!',
        failureRedirect: "/login"
    }), function(req, res){
});

router.get("/logged", function(req, res) {
    User.findOne({username: req.user.username}, function(err, user) {
        if(err) console.log(err);
        if(user) req.session.status = user.status;
        console.log("new status set", req.session.status);
        res.redirect("/profile");
    });
});

router.get("/reset", function(req, res){
    res.render("reset");
});

router.post("/reset", function(req, res) {
    
    if(!req.body.email) {
        req.flash("error", "Введите вашу почту!");
        return res.redirect("/reset");
    }   
   
    User.findOne({email: req.body.email.trim()}, function(err, founduser) {
        if(err) console.log(err);
           
        if(!founduser) {
            req.flash("error", "Пользователя с такой почтой не существует!");
            return res.redirect("/reset");
        }
            
        sgMail.setApiKey(api_key);
        const msg = {
            to: req.body.email,
            from: 'no-reply@bazarlar.kz',
            subject: 'Сброс пароля',
            html: 'Ваш логин: ' + founduser.username + '. Пройдите по ссылке для смены вашего пароля: <a href="' + res.locals.url +'/reset/' + founduser.token + '">Нажмите здесь.</a>',
        };
        sgMail.send(msg); 
            
        req.flash("success", "Проверьте вашу почту.");
        res.redirect("/reset");
    });
});

//logout route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Выход из системы!");
    res.redirect("/products");
});

router.get("/needtosignin", function(req, res) {
   req.flash("error", "Чтобы оставить рейтинг нужно сначала войти!");
   res.redirect("/login");
});

module.exports = router;