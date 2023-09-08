const path = require('path');
const fs = require ('fs');
//const ProductModel = require('../model/Product');
const UserModel = require('../model/Users');
const {success,failure} =require('../util/common');
const logFilePath = './Server/log.txt';
const { validationResult } = require("express-validator");


class userController{

      async getAll(req, res) {
        try {
          const users = await UserModel.find({});
          console.log(users);
          if (users.length>0) {
                return res.status(200).send(success("Successfully received all products", { result: users, total: users.length }));
            } else {
                return res.status(500).send(failure("No Data found!"));
            }
        } catch (error) {
          console.log(error);
          return res.status(500).send(failure("Internal server error"));
        }
      }

      async getOneById(req, res) {
        try {
          const { id } = req.query;
          const user = await UserModel.find({student_id:id});

          if (user) {
            return res.status(200).send(success("Successfully received the user", user));
          } else {
            return res.status(400).send(failure("Failed to received the user"));
          }
        } catch (error) {
          console.log(error);
          return res.status(500).send(failure("Internal server error"));
        }
      }

      async addItem(req,res){
        try{
          const validation = validationResult(req).array();
          if(validation.length===0){
              const { student_id,student_name, department,cgpa,courses } = req.body;
              const coursesArray = courses.map(course => ({
                                              course_id: course.course_id,
                                              score: course.score
                                            }));
              const user = new UserModel({ student_id:student_id,student_name:student_name, department:department,cgpa:cgpa, courses:coursesArray});
               await user
              .save()
              .then((data) => {
                const logEntry = `New Data Added: ${new Date().toISOString()}\n`;
                fs.appendFileSync(logFilePath, logEntry, 'utf-8');
                return res.status(200).send(success("Successfully added the user", data));
              })
              .catch((err) => {
                console.log(err);
                return res.status(400).send(failure("Failed to add the user"));
              });
            }else {
              return res.status(422).send(failure("Invalid inputs provided", validation));
            }

         }catch(error){
          return res.status(500).send(failure("Internal server error"));
      }
      }

      async deleteById(req,res){
        const{id} =req.query;
        try{
             const deleteItemResult = await UserModel.deleteOne({_id:id});
            if(deleteItemResult){
                return res.status(200).send(success('Item deleted Successfully',deleteItemResult));
            }
            else{
                return res.status(400).send(failure('Item not found!'));
            }
        }
        catch(error){
                return res.status(500).send(failure('Server error...'));
        }
      }
    
      async findByCgpa(req,res){
        const { cgpa } = req.query;
        try {
            const usersWithCgpa = await UserModel.find({ cgpa: { $gt: parseFloat(cgpa) } });
            
            if (usersWithCgpa.length > 0) {
                return res.status(200).send(success('Users found', usersWithCgpa));
            } else {
                return res.status(404).send(failure('No users found with the specified cgpa'));
            }
        } catch (error) {
            return res.status(500).send(failure('Server error...'));
        }
      }
      async updateByID(req, res) {
        try {
             const { id } = req.query;
            const updatedData = req.body;

        
            const updatedUser = await UserModel.findOneAndUpdate(
                                              { student_id: id },
                                               updatedData,
                                                { new: true }
            );

        if (updatedUser) {
            const logEntry = `User Data Updated: ${new Date().toISOString()}\n`;
            fs.appendFileSync(logFilePath, logEntry, 'utf-8');
            return res.status(200).send(success("Successfully updated the user", updatedUser));
        } else {
            return res.status(400).send(failure("Failed to update the user"));
        }
          } catch (error) {
              console.log(error);
               return res.status(500).send(failure("Internal server error"));
          }
      }
    
      //sorting in decending order
      async sortByCG (req,res){
        try {
            const sortbyCG = await UserModel.find().sort({ cgpa: -1 });
            
            if (sortbyCG.length > 0) {
                return res.status(200).send(success('Users found', sortbyCG));
            } else {
                return res.status(404).send(failure('No users found with the specified cgpa'));
            }
        } catch (error) {
          console.log(error);
            return res.status(500).send(failure('Server error...'));
        }
      }
}

module.exports = new userController();