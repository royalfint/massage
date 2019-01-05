var mongoose = require("mongoose");

var appartSchema = new mongoose.Schema({
    name: String,
    image: [String],
    desc: String
});

module.exports = mongoose.model("Service", appartSchema);
