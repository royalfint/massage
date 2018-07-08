//all the middleware goes here
var Comment     = require("../models/comment"),
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

module.exports = middlewareObj;