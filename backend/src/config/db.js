// src/config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    if (error.code === 8000) {
      console.error(
        "Authentication failed - Please check your database username and password",
      );
    }
    process.exit(1);
  }
};

module.exports = connectDB;
