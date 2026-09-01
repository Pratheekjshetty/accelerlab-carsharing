import carModel from '../models/carModels.js'
import cron from 'node-cron';
import fs from 'fs'

//add car
const addCar = async(req,res)=>{
    let image_filename = `${req.file.filename}`;
    const car = new carModel({
        name:req.body.name,
        description:req.body.description,
        price:req.body.price,
        category:req.body.category,
        location:req.body.location,
        color:req.body.color,
        seats:req.body.seats,
        model:req.body.model,
        image:image_filename
    })
    try{
        await car.save();
        res.json({success:true,message:"Car Added"});
    } catch(err){
        console.log(err)
        res.json({success:false,message:"Error"})
    }
}

//list all car
const listCar =async(req,res)=>{
    try{
        const cars=await carModel.find({});
        res.json({success:true,data:cars})
    }catch(err){
        console.log(err)
        res.json({success:false,message:"Error"})
    }
}

// list active cars
const listActiveCars = async (req, res) => {
    try {
        const cars = await carModel.find({ is_Active: "1"});
        res.json({success:true,data:cars});
    } catch (err) {
        console.log(err);
        res.json({success:false,message:"Error"});
    }
};

//remove car
const removeCar=async(req,res)=>{
    try{
        const car =await carModel.findById(req.body.id);
        fs.unlink(`uploads/${car.image}`,()=>{})
        await carModel.findByIdAndDelete(req.body.id);
        res.json({success:true,message:"Car Removed"})
    }catch(err){
        console.log(err)
        res.json({success:false,message:"Error"})
    }
}

//deactivate car
const deactivateCar = async (req, res) => {
    try {
        const car = await carModel.findById(req.body.id);
        if (!car) {
            return res.json({ success: false, message: "Car not found" });
        }
        car.is_Active = "0";
        await car.save();
        res.json({ success: true, message: "Car Deactivated" });
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: "Error" });
    }
};

//edit car
const editCar = async (req, res) => {
    try {
        console.log("Request Body:", req.body);
        const carId = req.body.id;
        if (!carId) {
            return res.json({ success: false, message: "Car ID not provided" });
        }
        console.log("Car ID:", carId);
        const car = await carModel.findById(carId);
        if (!car) {
            return res.json({ success: false, message: "Car not found" });
        }
        // If a new image is uploaded, replace the old one
        if (req.file) {
            console.log("Replacing image:", car.image);
            fs.unlink(`uploads/${car.image}`, () => {});
            car.image = `${req.file.filename}`;
        }
        // Update other car details
        car.name = req.body.name || car.name;
        car.description = req.body.description || car.description;
        car.price = req.body.price || car.price;
        car.category = req.body.category || car.category;
        car.location = req.body.location || car.location;
        car.color = req.body.color || car.color;
        car.seats = req.body.seats || car.seats;
        car.model = req.body.model || car.model;
        await car.save();
        res.json({ success: true, message: "Car Updated" });
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: "Error" });
    }
};

//get total cars
const getTotalCars = async (req, res) => {
    try {
        const count = await carModel.countDocuments({});
        res.json({ success: true, totalCars: count });
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: "Error" });
    }
};

export {addCar,listCar,listActiveCars,removeCar,deactivateCar,editCar,getTotalCars}