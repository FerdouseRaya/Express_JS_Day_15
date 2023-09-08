const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            requied: true,
            min: 0,
        },
        stock: {
            type: Number,
            requied: true,
            min: 0,
        },
        discountPercentage: {
            type: Number,
            required: false,
            min: 0,
            max: 100,
            default: 0,
        },
        rating: {
            type: Number,
            required: false,
            min: 0,
            max: 5,
            default: 0,
        },
        category: {
            type: [String],
            required: false,
        },
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;