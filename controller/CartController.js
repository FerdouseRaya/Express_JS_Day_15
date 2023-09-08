const { validationResult } = require("express-validator");
const { success, failure } = require("../util/common");
const CartModel = require("../model/Cart");
const ProductModel = require("../model/Product");
const logFilePath = "./Server/log.txt";

class Cart {
  async addtoCart(req, res) {
    try {
      const { user, product, quantity } = req.body;

      let cartItem = await CartModel.findOne({ user: user })
        .populate("user", "name email")
        .populate("products.product", "title price rating stock");

      if (!cartItem) {
        cartItem = new CartModel({
          user: user,
          products: [],
          Total: 0,
        });
      }

      // Find the selected product
      const selectedProduct = cartItem.products.find((item) => {
        return (
          item.product &&
          product &&
          item.product._id.toString() === product.toString()
        );
      });

      if (!selectedProduct) {
        const productInfo = await ProductModel.findById(product);

        if (!productInfo) {
          return res.status(404).send(failure("Product not found"));
        }

        if (productInfo.stock < quantity) {
          return res.status(400).send(failure("Product is out of stock."));
        }

        cartItem.products.push({ product: product, quantity: quantity });
      } else {
        const productInfo = await ProductModel.findById(
          selectedProduct.product
        );
        if (productInfo.stock < selectedProduct.quantity + quantity) {
          return res.status(400).send(failure("Product is out of stock."));
        }

        selectedProduct.quantity += quantity;
      }

      let total = 0;
      const productsList = cartItem.products.map((item) => item.product);
      const productsInCart = await ProductModel.find({
        _id: {
          $in: productsList,
        },
      }).select("price");

      total = productsInCart.reduce((previousValue, currentValue, i) => {
        return (
          previousValue + currentValue.price * cartItem.products[i].quantity
        );
      }, 0);

      cartItem.Total = total;
      await cartItem.save();
      res
        .status(200)
        .send(success("Product Added to cart successfully", cartItem));
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal server Error");
    }
  }

  async removefromCart(req, res) {
    const { user, product, quantity } = req.body;

    try {
      let cartItem = await CartModel.findOne({ user: user });
      let cartItem1 = await CartModel.findOne({ user: user }).populate(
        "products.product",
        "title price rating stock"
      );

      if (!cartItem) {
        return res.status(400).send(failure("There is no cart for the user"));
      }

      const existingProductIndex = cartItem.products
        ? cartItem.products.findIndex(
            (item) => item.product.toString() === product
          )
        : -1;

      if (existingProductIndex === -1) {
        return res
          .status(400)
          .send(failure("Product is not found in the cart."));
      }

      cartItem.products.splice(existingProductIndex, 1);
      let perquantityPrice = 0;
      for (const cartProduct of cartItem1.products) {
        const { price } = cartProduct.product;
        //console.log(price);
        //console.log(quantity);
        perquantityPrice = price * quantity;
        console.log(perquantityPrice);
      }
      cartItem.Total = cartItem.Total - perquantityPrice;
      await cartItem.save();

      return res
        .status(200)
        .send(success("Product has been removed from the Cart.", cartItem));
    } catch (error) {
      console.error(error);
      res.status(500).send(failure("Internal server error"));
    }
  }
}

module.exports = new Cart();
