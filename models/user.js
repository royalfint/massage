var mongoose = require("mongoose");
var bcrypt = require("bcrypt");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    address: String,
    title: String,
    phone: String,
    status: Number,
    website: String,
    desc: String,
    bazar: String,
    token: String,
    rating: Number,
    reviews: Number,
    email: String,
    city: String,
    country: String,
    rated: [String],
    faved: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }]
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);