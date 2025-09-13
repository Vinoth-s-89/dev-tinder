const connectionUrl =
  "mongodb+srv://vinoths:Vinoth89@nodelearning.qgbobqk.mongodb.net/devtinder";

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(connectionUrl);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
};

module.exports = connectDB;
