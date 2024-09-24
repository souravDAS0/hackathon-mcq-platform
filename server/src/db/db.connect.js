import mongoose from "mongoose";
import { DB_NAME } from "./../constant.js";

const connectDB = async () => {
  try {
    const instanceObj = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(instanceObj.connection.host);
  } catch (error) {
    console.log("MongoDB connection error");
    process.exit(1);
  }
};
export default connectDB;
