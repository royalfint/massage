var express     = require("express"),
    User  = require("../models/user"),
    passport  = require("passport"),
    sgMail   = require("@sendgrid/mail"),
    Product  = require("../models/product");
var router = express.Router();
var middleware = require("../middleware/index.js");
var countries = require("../models/countries.json").list;
var cities = require("../models/cities/KZ.json").list;
var bazars = require("../models/bazars.json").list;
var api_key = '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';

router.get("/", function(req, res) {
    res.redirect("/products");
});

router.get("/reset/:token", function(req, res) {
    res.render("resetform", {token: req.params.token});
});

router.post("/reset/:token", function(req, res){
    var post = {
        password: req.body.password.trim(),
        password2: req.body.password2.trim(),
        token: req.params.token.trim()
    };
    
    if(!post.password || !post.password.match(/^[a-zA-Z0-9]+$/) || post.password.length < 6 || post.password.length > 30) {
        req.flash("error", "Пароль должен быть на латинице от 6 до 30 символов!");
        return res.redirect("back");
    }
    
    if(post.password != post.password2){
        req.flash("error", "Пароли должны совпадать!");
        return res.redirect("back");
    }
    
    if(!post.token){
        req.flash("error", "Нет токена!");
        return res.redirect("back");
    }
        
    User.findOne({token: post.token}, function(err, user){
        if(err) console.log(err);
            
        if(!user){
            req.flash("error", "Нет пользователя с таким токеном!");
            return res.redirect("back");
        }
    
        user.setPassword(req.body.password, function(err, newuser){
            if(err) console.log(err);
            
            user.token = middleware.folder();
            user.save();
            
            req.flash("success", "Пароль успешно сменен!");
            return res.redirect("/login");
        });
    });
});

router.post("/rate", function(req, res) {
    var torate = req.body.torate;
    var rating = req.body.rating;
    var whorated = req.body.whorated;
    
    if(!whorated) return res.send("{'status':'503'}"); //need to login
    if(!torate) return res.send("{'status':'502'}"); //bad req
    if(!rating) return res.send("{'status':'502'}"); //bad req
    
    User.findOne({username: whorated}, function(err, whorateduser) {
        if(err) console.log(err);
       
        if(!whorateduser) return res.send("{'status':'502'}"); //bad req
        
        var canrate = { status: true };
        whorateduser.rated.forEach(function(rateName){
            if(rateName == torate) { canrate.status = false; }
        });
        
        if(!canrate.status) return res.send("{'status': '501'}"); //exists
        
        User.findOne({username: torate}, function(err, newhost){
           if(err) console.log(err);
           
           var wasrat = (newhost.rating * newhost.reviews);
           var plusrat = wasrat + Number(rating);
           var plusrev = (newhost.reviews + 1);
           var newrat = plusrat / plusrev;
           
           newhost.rating = newrat;
           newhost.reviews += 1;
           newhost.save();
           
           whorateduser.rated.push(torate);
           whorateduser.save();
           
           res.send("{'status': '200'}");
        });
    });
});

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

router.get("/profile", middleware.isLoggedIn, function(req, res) {
    User.findById(req.user.id, function(err, user){
        if(err) console.log(err);
        
        res.render("panel/profile", {user: user, countries: countries, cities: cities, bazars: bazars});
    });
});

router.post("/profile", middleware.isLoggedIn, function(req, res) {
    User.findById(req.user.id, function(err, user) {
        if(err) console.log(err);
        
        var post = {
            username: req.body.username.trim(),
            phone:    req.body.phone.trim(),
            address:  req.body.address.trim(),
            email:    req.body.email.trim(),
            bazar:    req.body.bazar.trim(),
            website:  req.body.website.trim(),
            title:    req.body.title.trim(),
            country:  req.body.country.trim(),
            city:     req.body.city.trim(),
            desc:     req.body.desc.trim()
        };
            
        if(!post.username || !post.username.match(/^[a-zA-Z0-9]+$/) || post.username.length < 3 || post.username.length > 20) {
            req.flash("error", "Логин должен быть на латинице от 3 до 20 символов!");
            return res.redirect("back");
        }
        
        if(!post.email || !post.email.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)){
            req.flash("error", "Введите правильный E-mail!");
            return req.redirect("back");
        }
        
        if(!post.phone || !post.phone.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)) {
            req.flash("error", "Телефон должен быть указан в формате +77001234567");
            return res.redirect("back");
        }
        
        if(!post.address || post.address.length < 8){
            req.flash("error", "Введите адрес!");
            return res.redirect("back");
        }
        
        if(post.website && !post.website.match(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi)){
            req.flash("error", "Ссылка на сайт должны быть в формате www.google.com");
            return res.redirect("back");
        }
        
        if(!post.desc || post.desc.length < 10){
            req.flash("error", "Описание должно быть не короче 10 символов!");
            return res.redirect("back");
        }
        
        if(!post.title || post.title.length < 1){
            req.flash("error", "Введите название точки!");
            return res.redirect("back");
        }
        
        if(post.country == "Страна") {
            req.flash("error", "Укажите Страну!");
            return res.redirect("back");
        }
        
        if(post.city == "Город") {
            req.flash("error", "Укажите Город!");
            return res.redirect("back");
        }
        
        if(post.bazar == "Базар"){
            req.flash("error", "Укажите базар!");
            return res.redirect("back");
        }

        user.username = post.username;
        user.phone = post.phone;
        user.email = post.email;
        user.title = post.title;
        user.address = post.address;
        user.bazar   = post.bazar;
        user.website = post.website;
        user.country = post.country;
        user.desc = post.desc;
        user.city = post.city;
        user.save();
        
        req.flash("success", "Добро пожаловать в Bazarlar, " + user.username + "!");
        res.redirect("/profile");
    });
});

router.get("/seller/:username", function(req, res) {
    var seller = req.params.username;
    User.findOne({username: seller}, function(err, foundSeller) {
       if(err) console.log(err);
       
        Product.find({'author.username': seller}).populate("author.id").exec(function(err, foundProducts){
            if(err) console.log(err);
            
            var canrate = { status: true };
            req.session.rates.forEach(function(rateName){
                if(rateName == foundSeller.username) { canrate.status = false; }
            });
            res.render("seller", {products: foundProducts, author: foundSeller});
        });
    });
});

router.post("/search", function(req, res) {
    var formquery = {
        term: req.body.query.trim(),
        city: req.body.city.trim(),
        bazar: req.body.bazar.trim(),
        type: req.body.type.trim()
    };
    
    req.session.search = formquery;
    
    var dbquery = [
        { "$lookup": {
          "from": User.collection.name,
          "localField": "author.id",
          "foreignField": "_id",
          "as": "author"
        }},
        { "$unwind": "$author" }
    ];
    
    if(formquery.term && formquery.term.length > 0)
        dbquery.push({ "$match": { "name": { "$regex": formquery.term, "$options": "i" } }});
        
    if(formquery.city != "Город")
        dbquery.push({ "$match": { "author.city": { "$in": [ formquery.city ] } }});
        
    if(formquery.bazar != "Базар")
        dbquery.push({ "$match": { "author.bazar": { "$in": [ formquery.bazar ] } }});
        
    if(formquery.type)
        dbquery.push({ "$match": { "type": { "$in": [ formquery.type ] } }});
    
    Product.aggregate(dbquery, function(err, allProducts){
        if(err) console.log(err);

        res.render("product/index", {products: allProducts, countries: countries, cities: cities, q: formquery, bazars: bazars});
    });
});

module.exports = router;