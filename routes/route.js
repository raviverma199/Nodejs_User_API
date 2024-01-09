const express = require("express");
const route = express.Router();
const connection = require("../DB/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session')
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

// =======================  Use session to keep track of login status ============================

route.use(session({
  secret: process.env.key, resave: true, saveUninitialized: true 
}));



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
route.post("/user_signup", async (req, res) => {
  try {
    // Extract user data from the request
    const user_data = {
      User_name: req.body.User_name,
      Email_Address: req.body.Email_Address,
    };

    // Extract and hash the password
    const password = req.body.Password;
    const hashedPassword = await bcrypt.hash(password, 10);
    user_data.Password = hashedPassword;

    const create_new_data = await user_signup.create({
      ...user_data,
      C_date: getCurrentDate(),
      C_time: getCurrentDateTime(),
    });

    // Check if user data is successfully inserted
    if (create_new_data) {
      res.status(200).json({
        status: "success",
        message: "User created successfully",
        user: create_new_data,
      });
    } else {
      // Handle case where data creation fails
      res.status(500).json({
        status: "error",
        message: "Failed to create user",
      });
    }
  } catch (error) {
    // Handle any errors that occur during the process
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
});



// ================================  API for Login by using name and password  ============================
route.post('/login_user', async (req, res) => {
  try {
    const { User_name, Password } = req.body;
    const user = await user_signup.findOne({ User_name });

    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    const isPasswordMatch = await bcrypt.compare(Password, user.Password);

    if (!isPasswordMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user._id, User_name: user.User_name },
      process.env.KEY,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

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




// Route for fetching all users (admin access only)
route.get('/users', verifyToken, (req, res) => {
  if (req.user.role === 'admin') {

    res.status(200).json({ status: 'success', message: 'List of all users', users });
  } else {
    res.status(403).json({ status: 'error', message: 'Access denied. Insufficient privileges.' });
  }
});


// ======================  API to get the user data  ==========================================
route.get('/get_user_data', async (req, res) => {
  try {
    // Fetch all user data
    const data = await user_signup.find().exec();

    if (data.length > 0) {
      res.status(200).json({
        status: 'success',
        message: 'User data retrieved successfully',
        user: data,
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: 'No users found',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
    });
  }
});




// ======================================   google AUTH =======================================

// Initialize passport and session
route.use(passport.initialize());
route.use(passport.session());

// Replace with your Google API credentials
const GOOGLE_CLIENT_ID = process.env.CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.CLIENT_SECRET_KEY;
const CALLBACK_URL = 'http://localhost:2000/auth/google/callback';


passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: CALLBACK_URL
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => {
  // Save user information in the session
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  // Retrieve user information from the session
  done(null, obj);
  console.log(done(null, obj))
});


route.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

route.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

route.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});



// =========================

module.exports = route;
