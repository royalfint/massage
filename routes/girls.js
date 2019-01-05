var express      = require("express"),
    Product      = require("../models/product"),
    User         = require("../models/user"),
    cats         = require("../models/cats.json").list,
    path         = require("path"),
    router       = express.Router(),
    middleware   = require("../middleware/index.js");
var help = require("./help");

router.get('/girls', function(req, res){
    res.render('')
});

module.exports = router;