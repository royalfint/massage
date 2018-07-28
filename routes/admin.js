var express     = require("express");
var router = express.Router();

router.get("/admin", function(req, res) {
   res.send("You are an admin, WOW!"); 
});

module.exports = router;