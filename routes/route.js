const express = require("express");
const route = express.Router();
const connection = require("../DB/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// =========== User signup schema ==============
const user_signup = require("../DB_schema/User_signup");

// ===========  Get route ====================
route.get("/", async (req, res) => {
    try {
      res.send("200");
    } catch (error) {
      console.log(error);
    }
  });


// =======================  Function for getting current Date  =================
function getCurrentDate() {
  var today = new Date();
  var day = today.getDate();
  var month = today.getMonth() + 1;
  var year = today.getFullYear();

  // Format the date as "DD-MM-YYYY"
  var formattedDate = `${day}-${month}-${year}`;

  return formattedDate;
}

// ========================= Function for getting the Current Time  ================
function getCurrentDateTime() {
  var today = new Date();
  var hours = today.getHours();
  var minutes = today.getMinutes();
  var seconds = today.getSeconds();

  var formattedDateTime = `${hours}:${minutes}:${seconds}`;

  return formattedDateTime;
}

// ===========   API for User signup for first Time  ========================
route.post("/User_signup", async (req, res) => {
  try {
    let user_data = {
        User_name: req.body.User_name,
        Email_Address: req.body.Email_Address,
    };
   let  Password = req.body.Password;
    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(Password, saltRound);
    user_data["Password"] = hashedPassword;

    const jwt_token = jwt.sign({ user_data }, process.env.key, {
      expiresIn: "1h",
    });

    const user = new user_signup({
      ...user_data,
      C_date: getCurrentDate(),
      C_time: getCurrentDateTime(),
      jwt_token: jwt_token,
    });

    const create_new_data = await user_signup.create(user);
    if (create_new_data) {
      res.status(200).json({
        status: "success",
        message: "User created successfully",
        user: create_new_data,
      });
    }else{
        res.status(500).json('failed to post the data')
    }
  } catch (error) {
    console.log(error);
  }
});



module.exports = route;
