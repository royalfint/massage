var mongoose = require("mongoose");

var productSchema = new mongoose.Schema({
    name: String,
    image: [String],
    desc: String,
    height: Number,
    weight: Number,
    boobs: Number,
    age: Number,
    created: Date,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment"
            }
        ]
});

module.exports = mongoose.model("Product", productSchema);
