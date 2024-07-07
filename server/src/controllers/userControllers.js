import userModel from "../models/userModels.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import validator from 'validator'
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

//Derive __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Ensure the upload directory exists
const uploadDir = path.join(__dirname, '..', 'user-uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const createToken = (id) =>{
    return jwt.sign({id},process.env.JWT_SECRET)
}

//login user
const loginUser =async(req,res)=>{
    const {email,password} = req.body;
    try{
        // checking is user doesn't exists
        const user = await userModel.findOne({email});
        if (!user){
            return res.status(400).json({success:false,message:"User doesn't exists"})
        }

        // checking if password matches
        const isMatch = await bcrypt.compare(password,user.password)
        if (!isMatch){
            return res.status(400).json({success:false,message:"Invalid credentials"})
        }

        //create a token before login
        const token =createToken(user._id);
        res.json({success:true, token, role:user.role})

    }catch(err){
        console.log(err);
        res.status(500).json({success:false,message:"Error"})
    }
}

//register user
const registerUser =async(req,res)=>{
    const {name,email,phone,password} = req.body;
    try{
        // checking is user already exists
        const exists = await userModel.findOne({email});
        if (exists){
            return res.status(400).json({success:false,message:"User already exists"})
        }

        // checking is phone already exists
        const phones = await userModel.findOne({phone});
        if (phones){
            return res.status(400).json({success:false,message:"Phone already exists"})
        }

        //validating email format & strong password
        if(!validator.isEmail(email)){
            return res.status(400).json({success:false,message:"Please enter a valid email"})
        }

        if(password.length<8){
            return res.status(400).json({success:false,message:"Please enter a strong password"})
        }

        //validating phone number
        if(!validator.isMobilePhone(phone)){
            return res.status(400).json({success:false,message:"Please enter a valid phone"})
        }

        //hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt);

        // getting image path
        const imagePath = req.file ? req.file.path : null;

        const newUser = new userModel({
            name:name,
            email:email,
            phone:phone,
            password:hashedPassword,
            role: 'user',
            image: imagePath
        })

        const user = await  newUser.save()
        const token = createToken(user._id)
        res.json({success:true, token, role: user.role})

    }catch(err){
        console.log(err);
        res.status(500).json({success:false,message:"Error"})
    }
}

export {loginUser,registerUser}