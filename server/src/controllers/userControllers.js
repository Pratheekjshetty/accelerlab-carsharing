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
const uploadDir = path.join(__dirname, '../..', 'user-uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const createToken = (id) =>{
    return jwt.sign({id},process.env.JWT_SECRET)
};

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
        // include the image URL in the response
        const imageURL = user.image ? path.join('user-uploads', path.basename(user.image)) : null;

        res.json({success:true, token, role:user.role,image: imageURL});

    }catch(err){
        console.log(err);
        res.status(500).json({success:false,message:"Error"})
    }
}

//register user
const registerUser =async(req,res)=>{
    const {name,email,phone,password} = req.body;
    let imagePath = req.file ? req.file.path : null;
    try{
        // checking is user already exists
        const exists = await userModel.findOne({email});
        if (exists){
            if (imagePath && fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            return res.status(400).json({success:false,message:"User already exists"})
        }

        // checking is phone already exists
        const phones = await userModel.findOne({phone});
        if (phones){
            if (imagePath && fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            return res.status(400).json({success:false,message:"Phone already exists"})
        }

        //validating email format & strong password
        if(!validator.isEmail(email)){
            if (imagePath && fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            return res.status(400).json({success:false,message:"Please enter a valid email"})
        }

        if(password.length<8){
            if (imagePath && fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            return res.status(400).json({success:false,message:"Please enter a strong password"})
        }

        //validating phone number
        if(!validator.isMobilePhone(phone)){
            if (imagePath && fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            return res.status(400).json({success:false,message:"Please enter a valid phone"})
        }

        //hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt);

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
        // include the image URL in the response
        const imageURL = user.image ? path.join('user-uploads', path.basename(user.image)) : null;
        res.json({success:true, token, role: user.role,image: imageURL})

    }catch(err){
        console.log(err);
        if (imagePath && fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
        res.status(500).json({success:false,message:"Error"})
    }
}

//edit user
const editUser = async (req, res) => {
    const { name, phone, email, password } = req.body;
    const userId = req.userId;

    try {
        // find the user by userId
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        // validate email
        if(!validator.isEmail(email)){
            return res.status(400).json({success:false,message:"Please enter a valid email"})
        }
        // validate phone number
        if (phone && !validator.isMobilePhone(phone)) {
            return res.status(400).json({ success: false, message: "Please enter a valid phone" });
        }

        // validate and hash password if provided
        if (password) {
            if (password.length < 8) {
                return res.status(400).json({ success: false, message: "Please enter a strong password" });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        // update the user's details
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;

        // update image if provided
        if (req.file) {
            // delete the old image if exists
            if (user.image && fs.existsSync(user.image)) {
                fs.unlinkSync(user.image);
            }
            user.image = req.file.path;
        }

        const updatedUser = await user.save();

        // Include the updated image URL in the response
        const imageURL = updatedUser.image ? path.join('user-uploads', path.basename(updatedUser.image)) : null;

        res.json({ success: true, message: "User updated successfully", user: { name: updatedUser.name, phone: updatedUser.phone,email: updatedUser.email, image: imageURL } });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Error updating user" });
    }
};
//get user
const getUser = async (req, res) => {
    try {
        const userId = req.userId; // Assuming userId is set by authMiddleware
        const user = await userModel.findById(userId).select('-password'); // Exclude password from selection

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Include the image URL in the response
        const imageURL = user.image ? path.join('user-uploads', path.basename(user.image)) : null;

        res.json({ success: true, user: { userId:user._id, name: user.name, email: user.email, phone: user.phone, image: imageURL, role:user.role } });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Error fetching user details' });
    }
};
const getUserById = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await userModel.findById(userId).select('-password'); // Exclude password from selection

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const imageURL = user.image ? path.join('user-uploads', path.basename(user.image)) : null;

        res.json({ success: true, user: { userId: user._id, name: user.name, email: user.email, phone: user.phone, image: imageURL, role: user.role } });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Error fetching user details' });
    }
};
const getCount = async (req, res) => {
    try {
        const userCount = await userModel.countDocuments({ role: 'user' });
        const driverCount = await userModel.countDocuments({ role: 'driver' });
        const adminCount = await userModel.countDocuments({ role: 'admin' });
        res.json({
            success: true,
            counts: {
                users: userCount,
                drivers: driverCount,
                admins: adminCount
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Error fetching user count' });
    }
};

export {loginUser,registerUser,editUser,getUser,getUserById,getCount}