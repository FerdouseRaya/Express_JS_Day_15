const mongoose = require('mongoose');

const authSchema = new mongoose.Schema(
    {        
        name:{
            type: String,
            required: true,
        },
        username:{
            type: String,
            required:true,
        },
        email:{
            type:String,
            unique:true,
            required:true,
        },
        password:{
            type: String,
            required: true,
            
        },
        role: {
            type: Number, 
            required: false,
            default: 2,
        },
        phone: {
            type: String,
            required: false,
        },
        User:{
            type:mongoose.Types.ObjectId,
            ref:"User",
            required: true,
        },
        lastLoginAttempt: {
            type: Date,
            default: null,
          },
        consecutiveFailedAttempts: {
            type: Number,
            default: 0,
          },
    },{timestamps:true}
)
const Auth = mongoose.model('Auth',authSchema);
module.exports = Auth;