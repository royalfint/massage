var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    address: String,
    title: String,
    phone: String,
    status: Number,
    desc: String,
    subdesc: String,
    token: String,
    rating: Number,
    balance: Number,
    reviews: Number,
    email: String,
    rated: [String],
    faved: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    ispaid: Boolean,
    active: Boolean,
    registered: Date,
    paydate: Date,
    girlsTitle: String,
    girlsSub: String,
    serviceTitle: String,
    serviceSub: String,
    appartsTitle: String,
    appartsSub: String,
    aboutTitle: String,
    aboutSub: String,
    aboutText: String,
    dealsTitle: String,
    dealsSub: String,
    contactsTitle: String,
    contactsSub: String,
    contactsText: String
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);