const mongoose = require('mongoose');
require("dotenv").config();

const mongoDBURL = process.env.DATABASE_STRING

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