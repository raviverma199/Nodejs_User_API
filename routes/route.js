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
    let Password = req.body.Password;
    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(Password, saltRound);
    user_data["Password"] = hashedPassword;

    const user = new user_signup({
      ...user_data,
      C_date: getCurrentDate(),
      C_time: getCurrentDateTime(),
    });

    const create_new_data = await user_signup.create(user);
    if (create_new_data) {
      res.status(200).json({
        status: "success",
        message: "User created successfully",
        user: create_new_data,
      });
    } else {
      res.status(500).json("failed to post the data");
    }
  } catch (error) {
    console.log(error);
  }
});



// ================================  API for Login by using name and password  ============================

route.get('/Login_User',async (req,res)=>{
  try {
    let {User_name,Password} = req.body;

    const get_user = await user_signup.findOne({User_name});

    if(!get_user){
      return res.status(401).json('invalid credintial')
    }

    const matchPassword = await bcrypt.compare(Password,get_user.Password)
    console.log(matchPassword);
    if(!matchPassword){
      return res.status(401).json('invalid credential') 
    }

    const token = jwt.sign({ user_id: get_user._id, User_name: get_user.User_name }, process.env.key, {
      expiresIn: '1h', 
    });
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      token: token,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });

  }
})

// =====================================   middleware to verify the jsonwebtoken ===========================
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized: Token is missing' });
  }

  jwt.verify(token, process.env.key, (err, decoded) => {
    if (err) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized: Invalid token' });
    }

    req.user = decoded;
    next();
  });
};



// ========================  user access if the credentials are true  =========================
route.get('/dashboard', verifyToken, (req, res) => {
  res.status(200).json({ status: 'success', message: 'Access granted', user: req.user });
});


route.post('/ususu',async(req,res)=>{
  try {
    let name = req.body.name
  } catch (error) {
    console.log(error);
  }
})

route.get("/Get_User_Data", async (req, res) => {
  try {
    const data = await user_signup.find().exec();
    const decodedTokens = data.map(user => jwt.verify(user.jwt_token, process.env.key));

    if (data) {
      res.status(200).json({
        status: "success",
        user: data,
        decodedTokens:decodedTokens
      });
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = route;
