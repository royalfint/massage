var express     = require("express"),
    Product  = require("../models/product"),
    Comment  = require("../models/comment");
var router = express.Router({mergeParams: true});
var middleware = require("../middleware/index.js");

//======================= COMMENTS ROUTES =============================//

router.get("/new", middleware.isLoggedIn, function(req, res){
    Product.findById(req.params.id, function(err, product){
        if(err){
            console.log(err);
        }else{
            res.render("comments/new", {product: product});
        }
    });
});

router.post("/", middleware.isLoggedIn, function(req, res){
    //lookup product using ID
    Product.findById(req.params.id, function(err, product){
        if(err){
            console.log(err);
            res.redirect("/products");
        }else{
            //create new comment
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                }else{
                    req.flash("success", "Successfully added comment");
                    //add author info to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    //connect new comment to product
                    product.comments.push(comment);
                    product.save();
                    //redirect to product show page
                    res.redirect("/products/"+product._id);
                }
            });
        }
    });
});

//COMMENT EDIT FORM
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        }else{
            res.render("comments/edit", {product_id: req.params.id, comment: foundComment});
        }
    });
});

//COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        }else{
            res.redirect("/products/" + req.params.id);
        }
    });
});

//COMMENT DESTROY
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        }else{
            req.flash("error", "You just destroyed a comment!");
            res.redirect("/products/" + req.params.id);
        }
    });
});

module.exports = router;