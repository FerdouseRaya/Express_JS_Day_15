const express = require("express");
const routes = express();
const ProductController = require("../controller/ProductController");
const {isAuthorized ,isAdmin}= require('../middleware/auth');

routes.get("/all",ProductController.getAll);
routes.get("/getProductByID",ProductController.getProductByID);
routes.delete("/deleteProductByID",ProductController.deleteProductByID);
routes.patch("/updateProductByID",isAuthorized,isAdmin,ProductController.updateProductByID);
routes.post("/create", isAuthorized,isAdmin, ProductController.create);
routes.get("/getSearchSort",ProductController.getSearchSort);

module.exports = routes;