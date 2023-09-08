const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const AuthModel = require('../model/Auth');
const UserModel = require('../model/User');
const {success,failure} =require('../util/common');
const { validationResult } = require("express-validator");
const jsonwebtoken = require('jsonwebtoken');

class AuthController{
    async login(req, res) {
        const { email, password } = req.body;
        const user = await AuthModel.findOne({ email: email });
      
        if (user) {

          
          const now = new Date();
          const lastAttempt = user.lastLoginAttempt || new Date(0);
          const timeSinceLastAttempt = now - lastAttempt;
          const attempts = 5;
          const timeOut = 1*60*1000;


          if(timeSinceLastAttempt<timeOut && user.consecutiveFailedAttempts>=attempts){
            res.status(400).send("Account locked due to excessive login attempts.");
          }



          const isValidPassword = await bcrypt.compare(password, user.password);
          if (isValidPassword) {
            console.log(isValidPassword);
            const info = await AuthModel.findOne({email: email })
            .select('-_id -name -password -createdAt -updatedAt')
            .populate('User','-password');
            //console.log("Data:", info);

            user.consecutiveFailedAttempts = 0;
            user.lastAttempt = null;
            await user.save();

            const responseAuth= user.toObject();
            delete responseAuth.password;
  
            const jswt = jsonwebtoken.sign(responseAuth, process.env.SECRET_KEY, { expiresIn: '1h' });
            responseAuth.token = jswt;
            //res.status(200).send(success("Successfully logged in!",jswt));


            res.status(200).send(success("Successfully logged in!",responseAuth));
          } else {  
              user.consecutiveFailedAttempts += 1;
              user.lastAttempt = now;
              await user.save();
      
              if (user.consecutiveFailedAttempts >= attempts) {
                 return res.status(401).send(failure('Account locked due to excessive login attempts.' ));
              }
            res.status(400).send(failure("Invalid Credentials"));
          
          }

        } else {
          res.status(400).send(failure('Authentication failed!'));
        }
      }
      
    async signup(req, res) {
      try {
        const validation = validationResult(req).array();
        if (validation.length > 0) {
            return res
                .status(400)
                .send(failure("Failed to Sign Up or add as a User", validation));
        }
          const { name, username, email, password,role,phone} = req.body;

          const existingEmail = await UserModel.findOne({ email: email });
          if (existingEmail) {
            return res.status(400).send(failure("User with the same email already exists"));
          }

          const hashedPass = await bcrypt.hash(password, 10).then((hash)=>{
            return hash;
          })
      
          const user = new UserModel({
            name: name,
            username: username,
            email: email,
            password: hashedPass,
            role:role,
            phone :phone,
            loginAttempts: 0
          });
      
          const savedUser = await user.save();
      
          const result = await AuthModel.create({
            name:name,
            username:username,
            email: email,
            password: hashedPass,
            role:role,
            User:savedUser._id
          });
      
          if (!result) {
            return res.status(400).send(failure('Signup was not successful'));
          }
      
          return res.status(200).send(success('Signup successfully', result));
        } catch (error) {
          console.log(error);
          return res.status(400).send(failure('Internal Server Error'));
        }
      }
      

}
module.exports =new AuthController();