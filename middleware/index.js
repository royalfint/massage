//all the middleware goes here
var Comment     = require("../models/comment"),
    crypto       = require("crypto"),
    Product  = require("../models/product");
    
var middlewareObj = {};

middlewareObj.checkProductOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Product.findById(req.params.id, function(err, foundProduct){
            if(err){
                res.redirect("back");
            }else{
                if(foundProduct.author.id.equals(req.user._id)){
                    next();
                }else{
                    req.flash("error", "У вас нет для этого прав!");
                    res.redirect("back");
                }
            }
        });
    }else{
        req.flash("error", "You need to logged in to do that!");
        res.redirect("back"); 
    }
};

middlewareObj.checkCommentOwnership = function (req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                req.flash("error", err);
                res.redirect("back");
            }else{
                if(foundComment.author.id.equals(req.user._id)){
                    next();
                }else{
                    req.flash("error", "У вас нет для этого прав!");
                    res.redirect("back");
                }
            }
        });
    }else{
       req.flash("error", "Сначала нужно войти в аккаунт!");
       res.redirect("back"); 
    }
};

middlewareObj.isLoggedIn = function (req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Сначала нужно войти в аккаунт!");
    res.redirect("/login");
};

middlewareObj.folder = function() {
    return crypto.randomBytes(16).toString('hex');
};

middlewareObj.daysToDate = function(input_date, daystoadd) {
    var date = new Date(input_date);
    var newdate = new Date(date);
    newdate.setDate(newdate.getDate() + daystoadd);
    return newdate;
};

middlewareObj.tillDate = function(welldate){ 
    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    var secondDate = new Date(welldate);
    var firstDate = new Date();
    //return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
    return Math.round((firstDate.getTime() - secondDate.getTime())/(oneDay) * -1);
};

middlewareObj.toLocalTime = function(time) {
  var d = new Date(time);
  var offset = (new Date().getTimezoneOffset() / 60) * -1;
  var n = new Date(d.getTime() + offset);
  return n;
};

middlewareObj.getRandomInt = function (max) {
  return Math.floor(Math.random() * Math.floor(max));
};

middlewareObj.deathTomorrow = function () {
    var date = middlewareObj.daysToDate(new Date(), 1);
    
    return date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
};

module.exports = middlewareObj;