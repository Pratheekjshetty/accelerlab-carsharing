import userModel from "../models/userModels.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import validator from 'validator'

//login user
const loginUser =async(req,res)=>{
    const {email,password} = req.body;
    try{
        // checking is user doesn't exists
        const user = await userModel.findOne({email});
        if (!user){
            return res.json({success:false,message:"User doesn't exists"})
        }

        // checking if password match
        const isMatch = await bcrypt.compare(password,user.password)
        if (!isMatch){
            return res.json({success:false,message:"Invalid credentials"})
        }

        //create a token before login
        const token =createToken(user._id);
        res.json({success:true,token})

    }catch(err){
        console.log(err);
        res.json({success:false,message:"Error"})
    }
}

const createToken = (id) =>{
    return jwt.sign({id},process.env.JWT_SECRET)
}

//register user
const registerUser =async(req,res)=>{
    const {name,email,phone,password} = req.body;
    try{
        // checking is user already exists
        const exists = await userModel.findOne({email});
        if (exists){
            return res.json({success:false,message:"User already exists"})
        }

        // checking is phone already exists
        const phones = await userModel.findOne({phone});
        if (phones){
            return res.json({success:false,message:"Phone already exists"})
        }

        //validating email format & strong password
        if(!validator.isEmail(email)){
            return res.json({success:false,message:"Please enter a valid email"})
        }

        if(password.length<8){
            return res.json({success:false,message:"Please enter a strong password"})
        }

        //validating phone number
        if(!validator.isMobilePhone(phone)){
            return res.json({success:false,message:"Please enter a valid phone"})
        }

        //hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new userModel({
            name:name,
            email:email,
            phone:phone,
            password:hashedPassword
        })

        const user = await  newUser.save()
        const token = createToken(user._id)
        res.json({success:true,token})

    }catch(err){
        console.log(err);
        res.json({success:false,message:"Error"})
    }
}

export {loginUser,registerUser}