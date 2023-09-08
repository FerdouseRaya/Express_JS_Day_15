const { validationResult } = require("express-validator");
const { success, failure } = require("../util/common");
const UserModel = require("../model/User");
const logFilePath = './Server/log.txt';

class UserController {
    async getAll(req, res) {
        try {
            const users = await UserModel.find({});
            if (users.length > 0) {
                return res.status(200).send(
                    success("Successfully received all users", {
                        result: users,
                        total: users.length,
                    })
                );
            }
            return res.status(400).send(failure("No users were found"));
        } catch (error) {
            console.log(error);
            return res
                .status(400)
                .send(failure("Internal server error"));
        }
    }

    async getUserByID(req, res) {
        try {
            const { id } = req.params;
            const user = await UserModel.findById({ _id: id });
            if (user) {
                return res
                    .status(200)
                    .send(success("Successfully received the user", user));
            } else {
                return res.status(200).send(failure("User does not exist"));
            }
        } catch (error) {
            console.log(error);
            return res
                .status(400)
                .send(failure("Internal server error"));
        }
    }

    async create(req, res) {
        try {
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                return res
                    .status(400)
                    .send(failure("Failed to add the user", validation));
            }
            const { name, username, email, role, phone } = req.body;

            const emailCheck = await UserModel.findOne({ email: email });
            if (emailCheck) {
                return res
                    .status(400)
                    .send(failure("User with email already exists"));
            }
            const user = await UserModel.create({
                name: name,
                username: username,
                email: email,
                role: role,
                phone: phone
            });
            if (user) {
                return res
                    .status(200)
                    .send(success("Successfully added the user", user));
            }
            return res
                .status(400)
                .send(failure("Failed to add the user"));
        } catch (error) {
            console.log(error);
            return res
                .status(400)
                .send(failure("Internal server error"));
        }
    }

    async updateUserByID(req, res) {
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

    async deleteUserByID(req,res){
        const{id} =req.query;
        try{
             const deleteItemResult = await UserModel.deleteOne({_id:id});
            if(deleteItemResult){
                return res.status(200).send(success('User deleted Successfully',deleteItemResult));
            }
            else{
                return res.status(400).send(failure('User not found!'));
            }
        }
        catch(error){
                return res.status(500).send(failure('Server error...'));
        }
      }
}

module.exports = new UserController();