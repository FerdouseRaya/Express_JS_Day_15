const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    cart: {
      type: mongoose.Types.ObjectId,
      ref: "Cart",
      required: true,
    },
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
    total: Number,
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
