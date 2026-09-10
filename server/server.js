import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './src/helper/db.js'
import carRouter from '../server/src/routers/carRoutes.js'
import userRouter from '../server/src/routers/userRoutes.js'
import rentRouter from '../server/src/routers/rentRouters.js'
import cancelRouter from '../server/src/routers/cancelRoutes.js'
import path from 'path'
import { fileURLToPath } from 'url'
import cron from 'node-cron';
import rentModel from './src/models/rentModels.js';
import availableModel from './src/models/availableModels.js';
import driverRouter from '../server/src/routers/driverRoutes.js';
import blogRouter from '../server/src/routers/blogRoutes.js';
import ratingRouter from './src/routers/ratingRoutes.js';
import nodemailer from 'nodemailer';
import availableRouter from './src/routers/availableRoutes.js';
import settingsRouter from './src/routers/settingsRoutes.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//app config
const app=express();
const port=process.env.PORT || 4001;

//middleware
app.use(express.json())
app.use(cors())

//db connection
connectDB();

//api endpoints
app.use('/images', express.static(path.join(__dirname, 'uploads')));
app.use('/api/car', carRouter);
app.use('/user-uploads', express.static(path.join(__dirname, 'user-uploads')));
app.use("/api/user", userRouter);
app.use("/api/book", rentRouter);
app.use("/api/cancel", cancelRouter);
app.use('/doc-uploads', express.static('doc-uploads'));
app.use('/api/driver', driverRouter);
app.use('/blog-uploads', express.static('blog-uploads'));
app.use('/api/blog', blogRouter);
app.use('/api/rating',ratingRouter);
app.use('/api/available',availableRouter);
app.use('/api/settings', settingsRouter);
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
  
    // Setup nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail', 
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });
  
    const mailOptions = {
      from: `${name} <${email}>`,
      replyTo: email,
      to: process.env.RECEIVING_EMAIL, // Your receiving email address
      subject: `Message from ${name}`,
      text: message,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      res.status(200).send('Message sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).send('Failed to send message');
    }
  });

app.get("/",(req,res)=>{
    res.send("Api Working")
})

cron.schedule('* * * * *', async () => {
    const currentDateTime = new Date();
    const currentDate = currentDateTime.toISOString().split('T')[0];
    const currentTime = currentDateTime.toTimeString().split(' ')[0];

    const yesterdayDateTime = new Date(currentDateTime);
    yesterdayDateTime.setDate(currentDateTime.getDate() - 1);
    const yesterdayDate = yesterdayDateTime.toISOString().split('T')[0];

    try {
        // Update status to "Car Started"
        const startedBookings = await rentModel.find({
            pickupdate: { $lte: currentDate },
            pickuptime: { $lte: currentTime },
            status: { $in: ["Car Not Cancelled", "Car Booked"] }
        });

        for (const booking of startedBookings) {
            await rentModel.findByIdAndUpdate(booking._id, { status: "Car Started" });
        }

        // Update status to "Car Reached Destination"
        const reachedBookings = await rentModel.find({
            dropoffdate: { $lte: currentDate },
            dropofftime: { $lte: currentTime },
            status: "Car Started"
        });

        for (const booking of reachedBookings) {
            await rentModel.findByIdAndUpdate(booking._id, { status: "Car Reached Destination" });
        }

        // Update status to "Car Available"
        const availableBookings = await rentModel.find({
            dropoffdate: { $eq: yesterdayDate },
            status: "Car Reached Destination"
        });

        for (const booking of availableBookings) {
            await rentModel.findByIdAndUpdate(booking._id, { status: "Car Available" });
        }

        // Check if today is the start date
        const adminStartBookings = await availableModel.find({
          startdate: { $eq: currentDate },
          status: { $in: ["Car Booked by Admin"] }
        });

        for (const booking of adminStartBookings) {
            await availableModel.findByIdAndUpdate(booking._id, { status: "Admin Car Being Started" });
        }

        // Check if today is the end date
        const adminEndBookings = await availableModel.find({
            enddate: { $eq: currentDate },
            status: { $in: ["Admin Car Being Started", "Car Booked by Admin"] }
        });

        for (const booking of adminEndBookings) {
            await availableModel.findByIdAndUpdate(booking._id, { status: "Admin Car Being Ended" });
        }

        // Update status to "Car Available" after booking ends
        const completedAdminBookings = await availableModel.find({
            enddate: { $eq: yesterdayDate },
            status: "Admin Car Being Ended"
        });

        for (const booking of completedAdminBookings) {
            await availableModel.findByIdAndUpdate(booking._id, { status: "Car Available" });
        }

    } catch (err) {
        console.error("Error updating booking status:", err);
    }
});

app.listen(port,()=>{
    console.log(`Server Started on http://localhost:${port}`)
})
