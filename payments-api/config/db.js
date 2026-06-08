const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    console.log("DEBUG: Attempting to connect to:", uri);

    if (!uri) {
      console.error("❌ MONGO_URI is missing.");
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;