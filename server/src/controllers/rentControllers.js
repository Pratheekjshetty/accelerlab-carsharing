import rentModel from "../models/rentModels.js";
import userModel from "../models/userModels.js";
import Razorpay from "razorpay";
import dotenv from 'dotenv';
dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

//placing user rent booking for frontend
const rentBooking =async(req,res)=>{
    const frontend_url = "http://localhost:3002"
    try{
        const newRent =new rentModel({
            userId:req.body.userId,
            caritem:req.body.caritem,
            amount:req.body.amount,
            address:req.body.address,
            pickupdate:req.body.pickupdate,
            dropoffdate:req.body.dropoffdate,
            pickuptime:req.body.pickuptime,
            dropofftime:req.body.dropofftime,
        })
        await newRent.save();
        await userModel.findByIdAndUpdate(req.body.userId,{bookingData:{}});
        const amountInPaise = req.body.amount * 100;

        const options = {
            amount: amountInPaise, 
            currency: "INR",
            receipt: newRent._id.toString(),
        };

        const rent = await razorpay.orders.create(options);

        res.json({
            success: true,
            rentId: rent.id,
            amount: rent.amount,
            currency: rent.currency,
            receipt: rent.receipt,
            success_url: `${frontend_url}/verify?success=true&rentId=${newRent._id}`,
            cancel_url: `${frontend_url}/verify?success=false&rentId=${newRent._id}`,
        });
    }
    catch(err){
        console.error(err);
        res.json({ success: false, message: "Rent Booking Error" });

    }
};

//verify booking
const verifyBooking = async(req,res)=>{
    const{rentId,success}=req.body;
    try{
        if(success=="true"){
            await rentModel.findByIdAndUpdate(rentId,{payment:true});
            res.json({success:true,message:"Paid"})
        }
        else{
            await rentModel.findByIdAndDelete(rentId);
            res.json({success:false,message:"Not Paid"})
        }
    }
    catch(err){
        console.log(err);
        res.json({success:false,message:"Error updating payment status"})
    }
}

//listing booking for users
const userBooking = async(req,res)=>{
    try{
        const booking=await rentModel.find({userId:req.body.userId});
        res.json({success:true,data:booking})
    }
    catch(err){
        console.log(err);
        res.json({success:false,message:"Error"})
    }
}

//listing booking for admin
const listBooking = async(req,res)=>{
    try{
        const booking=await rentModel.find({});
        res.json({success:true,data:booking})
    }
    catch(err){
        console.log(err);
        res.json({success:false,message:"Error"})
    }
}

//updating car status
const updateStatus = async (req,res)=>{
    try{
        await rentModel.findByIdAndUpdate(req.body.rentId,{status:req.body.status})
        res.json({success:true,message:"Status Updated"})
    }
    catch(err){
        console.log(err);
        res.json({success:false,message:"Error"}) 
    }
}
export {rentBooking,verifyBooking,userBooking,listBooking,updateStatus}