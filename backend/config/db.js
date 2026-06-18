import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI,{dbName:"Mern_user"});
    console.log("mongodb connected");
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;
