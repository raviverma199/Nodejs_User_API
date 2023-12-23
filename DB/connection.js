const mongoose = require('mongoose');

const mongoDBURL = "mongodb+srv://admin:admin123@cluster0.j2h40qx.mongodb.net/node_js";

async function connectToDatabase() {
  try {
    await mongoose.connect(mongoDBURL);
    console.log("MongoDB connection successful.");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

connectToDatabase();

  module.exports = connectToDatabase