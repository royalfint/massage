var mongoose = require("mongoose");
var bcrypt = require("bcrypt");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    address: String,
    title: String,
    phone: String,
    website: String,
    desc: String,
    city: String,
    country: String
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);