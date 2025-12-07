import mongoose from 'mongoose';
import config from './config.js';


const connectDB =async ()=>{
    try {
        await mongoose.connect(config.MONGO_URL,);
        console.log("✅ MongoDB connected successfully");

    } catch (error) {
               console.error("❌ MongoDB connection error:", error.message);
        process.exit(1);
    }
}

export default connectDB;