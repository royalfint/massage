var express     = require("express"),
    Product  = require("../models/product");
var router = express.Router();
var middleware = require("../middleware/index.js");

//================================APP ROUTES=========================//

//Index Route
router.get("/", function(req, res) {
    Product.find({}, function(err, allProducts){
        if(err){
            console.log(err);
        }else{
            res.render("product/index", {products: allProducts});
        }
    });
});

//POST NEW PRODUCT INTO DB
router.post("/", middleware.isLoggedIn, function(req, res) {
    var name = req.body.name;
    var image = req.body.image;
    var price = req.body.price;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newProduct = {name: name, image: image, description: desc, author: author, price: price};
    Product.create(newProduct, function(err, newlyCreated){
        if(err){
            console.log(err);
        }else{
            res.redirect("/products");
        }
    });
});

//NEW PRODUCT FORM
router.get("/new", middleware.isLoggedIn, function(req, res) {
    
    res.render("product/new");
});

//PRODUCT SHOWPAGE MOREEE
router.get("/:id",function(req, res){
    Product.findById(req.params.id).populate("comments").exec(function(err, foundProduct){
        if(err){
            console.log(err);
        }else{
            console.log(foundProduct);
            res.render("product/show", {product: foundProduct});
        }
    });
});

//EDIT PRODUCT ROUTE
router.get("/:id/edit", middleware.checkProductOwnership, function(req, res){
    Product.findById(req.params.id, function(err, foundProduct){
            if(err){
                req.flash("error", err.message);
                res.redirect("back");
            }else{
                res.render("product/edit", {product: foundProduct});
            }
        });
});

//UPDATE PRODUCT ROUTE
router.put("/:id", middleware.checkProductOwnership, function(req, res){
    Product.findByIdAndUpdate(req.params.id, req.body.product, function(err, updatedProduct){
        if(err){
            res.redirect("/products");
        }else{
            res.redirect("/products/" + req.params.id);
        }
    });
});

//DESTROY PRODUCT ROUTE
router.delete("/:id", middleware.checkProductOwnership, function(req, res){
    Product.findByIdAndRemove(req.params.id, function(err){
        if(err){
            req.flash("error", err.message);
            res.redirect("/products");
        }else{
            req.flash("success", "You just destroyed a product!");
            res.redirect("/products");
        }
    });
});

module.exports = router;