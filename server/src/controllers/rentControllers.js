import rentModel from "../models/rentModels";
import userModel from "../models/userModels"
import Razorpay from "razorpay";

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
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId,{bookingData:{}});
        const amountInPaise = req.body.amount * 100;

        const options = {
            amount: amountInPaise, 
            currency: "INR",
            receipt: newOrder._id.toString(),
        };

        const rent = await razorpay.rents.create(options);

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
}
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
        res.json({success:false,message:"Error"})
    }
}

export {rentBooking,verifyBooking}