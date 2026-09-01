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

const validatePassword = (password) => {
    const errors = [];
    if (password.startsWith(' ')) errors.push("Incorrect Password.");
    if (password.length < 8) errors.push("Password must be at least 8 characters long.");
    if (!/[A-Z]/.test(password)) errors.push("Password must include at least one uppercase letter.");
    if (!/[a-z]/.test(password)) errors.push("Password must include at least one lowercase letter.");
    if (!/[0-9]/.test(password)) errors.push("Password must include at least one number.");
    if (!/[#?!]/.test(password)) errors.push("Password must include at least one special character (#, ?, !).");
    return errors;
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
        // checking if user is active
        if (user.is_Active !== "1") {
            return res.status(403).json({ success: false, message: "User account is inactive" });
        }
        // checking if password matches
        const isMatch = await bcrypt.compare(password,user.password)
        if (!isMatch){
            return res.status(400).json({success:false,message:"Invalid credentials"})
        }
        //create a token before login
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
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
        const passwordErrors = validatePassword(password);
        if(passwordErrors.length > 0){
            if (imagePath && fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            return res.status(400).json({success: false, message: passwordErrors.join(" ") })
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
            const passwordErrors = validatePassword(password);
            if (passwordErrors.length > 0) {
                return res.status(400).json({ success: false, message: passwordErrors.join(" ") });
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

//add user by admin
const addUser = async (req, res) => {
    const { name,email,phone,password } = req.body;
    let imagePath = req.file ? req.file.path : null;
    try {
        // Check if email already exists
        const exists = await userModel.findOne({ email });
        if (exists) {
            if (imagePath && fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            return res.status(400).json({success:false,message:"User already exists"});
        }
        // Check if phone already exists
        const phoneExists = await userModel.findOne({ phone });
        if (phoneExists) {
            if (imagePath && fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            return res.status(400).json({success:false,message:"Phone already exists"});
        }
        // Validate email
        if (!validator.isEmail(email)) {
            if (imagePath && fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            return res.status(400).json({success:false,message:"Please enter a valid email"});
        }
        // Validate phone
        if (!validator.isMobilePhone(phone)) {
            if (imagePath && fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            return res.status(400).json({success:false,message:"Please enter a valid phone"});
        }
        // Validate password
        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
            if (imagePath && fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            return res.status(400).json({success: false,message: passwordErrors.join(" ")});
        }
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // Create user
        const newUser = new userModel({
            name,
            email,
            phone,
            password: hashedPassword,
            role: "user",
            is_Active: "1",
            image: imagePath
        });
        const user = await newUser.save();
        const imageURL = user.image
            ? path.join("user-uploads", path.basename(user.image))
            : null;
        res.json({
            success: true,
            message: "User added successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                image: imageURL
            }
        });
    } catch (error) {
        console.log(error);
        if (imagePath && fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
        res.status(500).json({success:false,message:"Error adding user"});
    }
};

// edit user by admin
const adminEditUser = async (req, res) => {
    const { name, phone, email } = req.body;
    const { userId } = req.params;
    try {
        // Find the user selected by admin
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({success:false,message:"User not found"});
        }
        // Validate email
        if (email && !validator.isEmail(email)) {
            return res.status(400).json({success:false,message:"Please enter a valid email"});
        }
        // Validate phone
        if (phone && !validator.isMobilePhone(phone)) {
            return res.status(400).json({success:false,message:"Please enter a valid phone"});
        }
        // Check if email belongs to another user
        if (email && email !== user.email) {
            const emailExists = await userModel.findOne({
                email,
                _id: { $ne: userId }
            });
            if (emailExists) {
                return res.status(400).json({success:false,message:"Email already exists"});
            }
        }
        // Check if phone belongs to another user
        if (phone && phone !== user.phone) {
            const phoneExists = await userModel.findOne({
                phone,
                _id: { $ne: userId }
            });
            if (phoneExists) {
                return res.status(400).json({success:false,message:"Phone already exists"});
            }
        }
        // Update details
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        // Update image if admin uploaded a new one
        if (req.file) {
            // Delete old image
            if (user.image && fs.existsSync(user.image)) {
                fs.unlinkSync(user.image);
            }
            user.image = req.file.path;
        }
        // Save updated user
        const updatedUser = await user.save();
        // Image URL
        const imageURL = updatedUser.image
            ? path.join(
                "user-uploads",
                path.basename(updatedUser.image)
            )
            : null;
        res.json({
            success: true,
            message: "User updated successfully",
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                phone: updatedUser.phone,
                email: updatedUser.email,
                image: imageURL,
                role: updatedUser.role
            }
        });
    } catch (error) {
        console.log(error);
        // Delete newly uploaded image if update failed
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({success: false,message: "Error updating user"});
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

//get user by id
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

//get count of users by role
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

//list active users by role
const listActiveUsersByRole = async (req, res) => {
    try {
        const role = req.params.role;
        const users = await userModel.find({ role: role, is_Active: "1"  }).select('-password');
        // if (!users || users.length === 0) {
        //     return res.status(404).json({ success: false, message: 'No active users found' });
        // }
        res.json({ success: true, users });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Error fetching users' });
    }
};

//deactivate user
const deactivateUser = async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      user.is_Active = "0";
      await user.save();
      res.json({ success: true, message: "User has been deactivated successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, message: "Error deactivating user" });
    }
};

export {loginUser,registerUser,editUser,getUser,getUserById,getCount,listActiveUsersByRole,deactivateUser,addUser,adminEditUser};