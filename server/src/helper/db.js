import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config();

const connectDB = async () => {
    try {
        const url = process.env.MONGO_URI;
        await mongoose.connect(url);
        console.log("Connected to DB");
    } catch (err) {
        console.log(err);
        console.log("Error while Connecting to DB");
    }
};
export default connectDB;