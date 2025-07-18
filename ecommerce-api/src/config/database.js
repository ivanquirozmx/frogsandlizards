import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dbURI = process.env.MONGODB_URI || "mongodb://localhost:27017/frogsandlizards";
const dbName = proccess.env .MONGO_DB;

try {
    await mongoose.connect(`${dbURI}/${dbName}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log("MONGODB IS CONNECTED");
} catch (error) {
    console.log(error);
    process.exit(1);
}