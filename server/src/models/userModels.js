import mongoose from 'mongoose'

const userSchema =new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    phone:{type:String,required:true,},
    password:{type:String,required:true},
    // image:{type:[String],data:Buffer,required:true},
    bookingData:{type:Object,default:{}}
},{minimize:false})

const userModel = mongoose.models.user || mongoose.model("user",userSchema);
export default userModel;