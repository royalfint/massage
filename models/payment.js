var mongoose = require("mongoose");

var paymentsSchema = new mongoose.Schema({
    payid: Number,
    session: String,
    username: String
});

module.exports = mongoose.model("Payment", paymentsSchema);
