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
            key: process.env.RAZORPAY_KEY_ID, 
            success_url: `${frontend_url}/verify?success=true&rentId=${newRent._id}`,
            cancel_url: `${frontend_url}/verify?success=false&rentId=${newRent._id}`,
        });
    }catch(err){
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
            const booking = await rentModel.findById(rentId);
            if (!booking) {
                return res.status(404).json({ success: false, message: "Booking not found" });
            }
            await userModel.findByIdAndUpdate(booking.userId, {
                $set: {
                    bookingData: booking
                }
            });
            return res.json({ success: true, message: "Paid and booking data saved" });
        }else{
            await rentModel.findByIdAndDelete(rentId);
            return res.json({success:false,message:"Not Paid"})
        }
    }catch(err){
        console.log(err);
        res.json({success:false,message:"Error updating payment status"})
    }
}

//listing booking for users
const userBooking = async(req,res)=>{
    try{
        const booking=await rentModel.find({userId:req.body.userId,payment:true});
        res.json({success:true,data:booking})
    }catch(err){
        console.log(err);
        res.json({success:false,message:"Error"})
    }
}

//listing booking for admin
const listBooking = async(req,res)=>{
    try{
        const booking=await rentModel.find({});
        res.json({success:true,data:booking})
    }catch(err){
        console.log(err);
        res.json({success:false,message:"Error"})
    }
}

//updating car status
const updateStatus = async (req,res)=>{
    try{
        await rentModel.findByIdAndUpdate(req.body.rentId,{status:req.body.status})
        res.json({success:true,message:"Status Updated"})
    }catch(err){
        console.log(err);
        res.json({success:false,message:"Error"}) 
    }
}

//get weekly bookings  
const getWeekBookings = async (req, res) => {
    try {
        const firstBooking = await rentModel.findOne().sort({ date: 1 });
        if (!firstBooking) {
          return res.status(404).json({ success: false, message: "No bookings found" });
        }
        const bookings = await rentModel.aggregate([
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%U",
                  date: "$date",
                  timezone: "Asia/Kolkata",
                },
              },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ]);
        res.json(bookings);
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Error fetching weekly bookings" });
      }
  };
  
  const getCarBookingPercentages = async (req, res) => {
    try {
      const bookings = await rentModel.find({});
      const totalBookings = bookings.length;
      if (totalBookings === 0) {
        return res.json({ success: true, data: [] });
      }
      const bookingCounts = await rentModel.aggregate([
        {
          $group: {
            _id: "$caritem.name",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]);
      const carBookingPercentages = bookingCounts.map((car) => {
        const percentage = ((car.count / totalBookings) * 100).toFixed(2);
        return {
          carModel: car._id,
          count: car.count,
          percentage: percentage,
        };
      });
      res.json({ success: true, data: carBookingPercentages });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Error fetching car booking percentages" });
    }
  };

export {rentBooking,verifyBooking,userBooking,listBooking,updateStatus,getWeekBookings,getCarBookingPercentages}