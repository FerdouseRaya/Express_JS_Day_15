const express = require('express');
const AuthController = require('../controller/Auth');
const {authValidator} =require("../middleware/validation_01");

 
const routes = express.Router();

routes.post('/login',AuthController.login);
routes.post('/sign-up',authValidator.signup,AuthController.signup);


routes.use('*', (req, res) => {
    return res.status(400).send('Wrong URL!');
});
module.exports = routes;

