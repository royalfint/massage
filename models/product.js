var mongoose = require("mongoose");

var productSchema = new mongoose.Schema({
    name: String,
    image: [String],
    desc: String,
    cat: String,
    subcat: String,
    price: Number,
    type: String,
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
