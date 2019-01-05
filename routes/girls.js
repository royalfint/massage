var express     = require("express"),
    User  = require("../models/user"),
    Appart = require("../models/appart"),
    Service = require("../models/service"),
    Deal    = require("../models/deal"),
    passport  = require("passport"),
    sgMail   = require("@sendgrid/mail"),
    Product  = require("../models/product");
var router = express.Router();
var middleware = require("../middleware/index.js");
var countries = require("../models/countries.json").list;
var cities = require("../models/cities/KZ.json").list;
var bazars = require("../models/bazars.json").list;
var api_key = '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';

router.get('/girls', function(req, res){
    
    User.findOne({username: 'admin'}, function(err, profile){
        if(err) console.log(err);
        
        Product.find({}, function(err, allProducts){
            if(err) console.log(err);
            
            res.render("girls", {girls: allProducts, profile: profile });
        });
    });
});

router.get('/services', function(req, res){
    
    User.findOne({username: 'admin'}, function(err, profile){
        if(err) console.log(err);
        
        Service.find({}, function(err, allProducts){
            if(err) console.log(err);
            
            res.render("services", {services: allProducts, profile: profile });
        });
    });
});

router.get('/apparts', function(req, res){
    
    User.findOne({username: 'admin'}, function(err, profile){
        if(err) console.log(err);
        
        Appart.find({}, function(err, allProducts){
            if(err) console.log(err);
            
            res.render("apparts", {apparts: allProducts, profile: profile });
        });
    });
});

module.exports = router;