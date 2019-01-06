var express     = require("express"),
    User  = require("../models/user"),
    Appart = require("../models/appart"),
    Service = require("../models/service"),
    Deal    = require("../models/deal"),
    passport  = require("passport"),
    sgMail   = require("@sendgrid/mail"),
    mongoose       = require("mongoose"),
    Product  = require("../models/product");
var router = express.Router();
var middleware = require("../middleware/index.js");
var countries = require("../models/countries.json").list;
var cities = require("../models/cities/KZ.json").list;
var bazars = require("../models/bazars.json").list;
var api_key = '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';

router.get("/en", function(req, res){
    mongoose.disconnect(function(err){
        if(err) console.log(err);
        global.lang = "en";
        res.locals.lang = global.lang;
        
        mongoose.connect('mongodb://admin:YtEpyftimVjq1Gfhjkm@ds145463.mlab.com:45463/massajen'); 
        return res.redirect('/');
    });
});

router.get("/ru", function(req, res){
    mongoose.disconnect(function(err){
        if(err) console.log(err);
        global.lang = "ru";
        res.locals.lang = global.lang;
        
        mongoose.connect('mongodb://admin:YtEpyftimVjq1Gfhjkm@ds149344.mlab.com:49344/massaj'); 
        return res.redirect('/');
    });
});

router.get("/", function(req, res) {
    User.findOne({username: 'admin'}, function(err, profile){
        if(err) console.log(err);
        
        global.title = profile.title;
        global.address = profile.address;
        global.phone = profile.phone;
        global.girlsTitle = profile.girlsTitle;
        global.serviceTitle = profile.serviceTitle;
        global.appartsTitle = profile.appartsTitle;
        global.aboutTitle = profile.aboutTitle;
        global.dealsTitle = profile.dealsTitle;
        global.contactsTitle = profile.contactsTitle;
        
        res.locals.title = global.title;
        res.locals.address = global.address;
        res.locals.phone = global.phone;
        res.locals.girlsTitle = global.girlsTitle;
        res.locals.serviceTitle = global.serviceTitle;
        res.locals.appartsTitle = global.appartsTitle;
        res.locals.aboutTitle = global.aboutTitle;
        res.locals.dealsTitle = global.dealsTitle;
        res.locals.contactsTitle = global.contactsTitle;
        
        Product.find({}).sort({created: -1}).limit(4).exec(function(err, allProducts){
            if(err) console.log(err);
            
            var formquery = {};
            
            if(req.session.search)
                formquery = req.session.search;
                
            Appart.find({}).limit(4).exec(function(err, allApps){
               if(err) console.log(err);
               
                Service.find({}).limit(2).exec(function(err, allServices){
                    if(err) console.log(err);
                    
                    Deal.find({}).limit(3).exec(function(err, allDeals){
                        if(err) console.log(err);
                        
                        res.render("landingpage", {girls: allProducts, q: formquery, profile: profile, apparts: allApps, services: allServices, deals: allDeals });
                    });
                });
            });
        });  
    });
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

router.post("/fav", function(req, res){
    var tofav = req.body.tofav; //product to fav
    var whofaved = req.body.whofaved;
    
    if(!whofaved) return res.send({status: 404}); //no auth
    if(!tofav) return res.send({status: 405}); //no prod info
    
    Product.findById(tofav, function(err, foundProduct){
       if(err) console.log(err);
       
       if(!foundProduct) return res.send({status: 400}); //wrong prod id
       
       User.findOne({username: whofaved}).populate("faved").exec(function(err, whofaveduser){
            if(err) console.log();
           
            console.log(whofaveduser);
            
            var newfaved = whofaveduser.faved;
           
            var exists = { status: false };
            newfaved.forEach(function(favItem){
               if(favItem._id.equals(foundProduct._id)){
                   exists.status = true;
               }
            });
            
            if(!exists.status)
                newfaved.push(foundProduct);
            else {
                var ind = whofaveduser.faved.indexOf(foundProduct);
                newfaved.splice(ind, 1);
            }
            
            whofaveduser.faved = newfaved;
            whofaveduser.save(function(err){
               if(err) console.log(err);
            });
            
            res.send({status: 200});
        });
    });
});

router.post("/rate", function(req, res) {
    var torate = req.body.torate;
    var rating = req.body.rating;
    var whorated = req.body.whorated;
    
    if(!whorated) return res.send({"status": 503}); //need to login
    if(!torate) return res.send({"status": 502}); //bad req
    if(!rating) return res.send({"status": 502}); //bad req
    
    User.findOne({username: whorated}, function(err, whorateduser) {
        if(err) console.log(err);
       
        if(!whorateduser) return res.send({"status": 502}); //bad req
        
        var canrate = { status: true };
        whorateduser.rated.forEach(function(rateName){ if(rateName == torate) { canrate.status = false; } });
        
        if(!canrate.status) return res.send({"status": 501}); //exists
        
        whorateduser.rated = whorateduser.rated.concat([torate]);
        whorateduser.save();
        
        console.log(whorateduser);
        
        User.findOne({username: torate}, function(err, newhost){
           if(err) console.log(err);
           
           var wasrat = (newhost.rating * newhost.reviews);
           var plusrat = wasrat + Number(rating);
           var plusrev = (newhost.reviews + 1);
           var newrat = plusrat / plusrev;
           
           newhost.rating = newrat;
           newhost.reviews += 1;
           newhost.save();
           
           res.send({"status": 200});
        });
    });
});

router.get("/myproducts", middleware.isLoggedIn, function(req, res) {
    var seller = req.user.username;
    User.findOne({username: seller}, function(err, foundSeller) {
       if(err) console.log(err); 
       
        Product.find({'author.username': seller}).populate("author.id").exec(function(err, foundProducts){
            if(err){
                console.log(err);
            }else{
                res.render("panel/myproducts", {products: foundProducts, author: foundSeller});
            }
        });
    });
});

router.get("/myservices", middleware.isLoggedIn, function(req, res){
    
    Service.find({}).exec(function(err, foundApps){
        if(err){ console.log(err); }
        
        res.render("panel/myservices", {products: foundApps});
    });
});

router.get("/myapparts", middleware.isLoggedIn, function(req, res) {

    Appart.find({}).exec(function(err, foundApps){
        if(err){ console.log(err); }
        
        res.render("panel/myapparts", {apparts: foundApps});
    });
});

router.get("/mydeals", middleware.isLoggedIn, function(req, res) {

    Deal.find({}).exec(function(err, foundApps){
        if(err){ console.log(err); }
        
        res.render("panel/mydeals", {products: foundApps});
    });
});

router.get("/favs", middleware.isLoggedIn, function(req, res) {
    var seller = req.user.username;
    
    User.findOne({username: seller}).populate("faved").exec(function(err, foundSeller){
        if(err) console.log(err); 
       
        if(!foundSeller) res.send("404");
        
        console.log(foundSeller);
       
        res.render("panel/favs", {products: foundSeller.faved, author: foundSeller});
    });
});

router.get("/profile", middleware.isLoggedIn, function(req, res) {
    User.findById(req.user.id, function(err, user){
        if(err) console.log(err);
        
        res.render("panel/profile", {user: user, countries: countries, cities: cities, bazars: bazars, folder: middleware.folder});
    });
});

router.get("/mytexts", middleware.isLoggedIn, function(req, res) {
    User.findById(req.user.id, function(err, user){
        if(err) console.log(err);
        
        res.render("panel/texts", {user: user, folder: middleware.folder});
    });
});
    
router.post("/texts", middleware.isLoggedIn, function(req, res) {
    User.findById(req.user.id, function(err, user) {
        if(err) console.log(err);
        
        var post = {
            girlsTitle: req.body.girlsTitle.trim(),
            girlsSub: req.body.girlsSub.trim(),
            serviceTitle: req.body.serviceTitle.trim(),
            serviceSub: req.body.serviceSub.trim(),
            appartsTitle: req.body.appartsTitle.trim(),
            appartsSub: req.body.appartsSub.trim(),
            aboutTitle: req.body.aboutTitle.trim(),
            aboutSub: req.body.aboutSub.trim(),
            aboutText: req.body.aboutText.trim(),
            dealsTitle: req.body.dealsTitle.trim(),
            dealsSub: req.body.dealsSub.trim(),
            contactsTitle: req.body.contactsTitle.trim(),
            contactsSub: req.body.contactsSub.trim(),
            contactsText: req.body.contactsText.trim()
        };
            
        if(!post.girlsTitle || !post.girlsSub || !post.serviceTitle || !post.serviceSub || !post.appartsTitle 
        || !post.appartsSub || !post.aboutTitle || !post.aboutSub|| !post.aboutText || !post.dealsTitle
        || !post.dealsSub || !post.contactsTitle || !post.contactsSub || !post.contactsText ) {
            req.flash("error", "Заполните все поля!");
            return res.redirect("back");
        }
        
        user.girlsTitle = post.girlsTitle;
        user.girlsSub = post.girlsSub;
        user.serviceTitle = post.serviceTitle;
        user.serviceSub = post.serviceSub;
        user.appartsTitle = post.appartsTitle;
        user.appartsSub = post.appartsSub;
        user.aboutTitle = post.aboutTitle;
        user.aboutSub = post.aboutSub;
        user.aboutText = post.aboutText;
        user.dealsTitle = post.dealsTitle;
        user.dealsSub = post.dealsSub;
        user.contactsTitle = post.contactsTitle;
        user.contactsSub = post.contactsSub;
        user.contactsText = post.contactsText;
        user.save();
        
        req.flash("success", "Текст успешно обновлен!");
        res.redirect("/mytexts");
    });
});

router.post("/profile", middleware.isLoggedIn, function(req, res) {
    User.findById(req.user.id, function(err, user) {
        if(err) console.log(err);
        
        var post = {
            username: req.body.username.trim(),
            email:    req.body.email.trim(),
            phone:    req.body.phone.trim(),
            address:  req.body.address.trim(),
            title:    req.body.title.trim(),
            desc:     req.body.desc.trim(),
            subdesc:  req.body.subdesc.trim()
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
        
        if(!post.address || post.address.length < 4){
            req.flash("error", "Введите адрес!");
            return res.redirect("back");
        }
        
        if(!post.desc || post.desc.length < 10){
            req.flash("error", "Описание должно быть не короче 10 символов!");
            return res.redirect("back");
        }
        
        if(!post.subdesc || post.subdesc.length < 10){
            req.flash("error", "Под описание должно быть не короче 10 символов!");
            return res.redirect("back");
        }
        
        
        if(!post.title || post.title.length < 1){
            req.flash("error", "Введите название салона!");
            return res.redirect("back");
        }
        
        user.username = post.username;
        user.phone = post.phone;
        user.email = post.email;
        user.title = post.title;
        user.address = post.address;
        user.desc = post.desc;
        user.subdesc = post.subdesc;
        user.save();
        
        req.flash("success", "Профиль успешно обновлен!");
        res.redirect("/profile");
    });
});

router.get("/seller/:username", function(req, res) {
    var seller = req.params.username;
    User.findOne({username: seller}, function(err, foundSeller) {
       if(err) console.log(err);
       
        Product.find({'author.username': seller}).populate("author.id").exec(function(err, foundProducts){
            if(err) console.log(err);
        
            res.render("seller", {products: foundProducts, author: foundSeller});
        });
    });
});

router.post("/search", function(req, res) {
    var formquery = {
        term: req.body.query,
        city: req.body.city,
        bazar: req.body.bazar,
        sort: req.body.sort,
        type: req.body.type
    };
    req.session.search = formquery;
    
    var dbquery = [
        { $lookup: {
          from: 'users',
          localField: "author.id",
          foreignField: "_id",
          as: "author"
        }},
        { "$unwind": "$author" }
    ];
    
    if(formquery.term && formquery.term.length > 0)
        dbquery.push({ "$match": { "name": { "$regex": formquery.term, "$options": "i" } }});
        
    if(formquery.city && formquery.city != "Город")
        dbquery.push({ "$match": { "author.city": { "$in": [ formquery.city ] } }});
        
    if(formquery.bazar && formquery.bazar != "Базар")
        dbquery.push({ "$match": { "author.bazar": { "$in": [ formquery.bazar ] } }});
    
    if(formquery.type && formquery.type != "Оптом и в розницу")
        dbquery.push({ "$match": { "type": { "$in": [ formquery.type ] } }});
    
    if (formquery.sort && formquery.sort == "Самые дешевые") {
        dbquery.push({ "$sort": { "price": 1 }});
    } else if(formquery.sort && formquery.sort == "Самые дорогие") {
        dbquery.push({ "$sort": { "price": -1 }});
    } else if(formquery.sort && formquery.sort == "Самые первые") {
        dbquery.push({ "$sort": { "created": 1 }});
    } else {
        dbquery.push({ "$sort": { "created": -1 }}); //new products always go first
    }
    
    Product.aggregate(dbquery, function(err, allProducts){
        if(err) console.log(err);

        res.render("product/index", {products: allProducts, countries: countries, cities: cities, q: formquery, bazars: bazars});
    });
});

module.exports = router;