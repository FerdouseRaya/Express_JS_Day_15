const mongoose = require("mongoose");
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: {
      type: [
        {
          product: {
            type: mongoose.Types.ObjectId,
            ref: "Product",
          },
          quantity: Number,
          _id: false,
        },
      ],
    },
    Total: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
