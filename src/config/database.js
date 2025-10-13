const connectionUrl = process.env.DATABASE_CONNECTION_URL;

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
