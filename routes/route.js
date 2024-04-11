const express = require("express");
const route = express.Router();
const connection = require("../DB/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
require("dotenv").config();
const controller = require('../controller/controller');

// =========== User signup schema ==============
const user_signup = require("../DB_schema/User_signup");

// ==============  shopping cart schema  ======================
const Cart_Schema = require("../DB_schema/cart_schema");

// ===========  Get route ====================
route.get("/", async (req, res) => {
  try {
    res.send("200");
  } catch (error) {
    console.log(error);
  }
});

// =======================  Use session to keep track of login status ============================

route.use(
  session({
    secret: process.env.key,
    resave: true,
    saveUninitialized: true,
  })
);

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

// ============================  middlewares ===================================
const redirectLogin = (req, res, next) => {
  try {
      // Check if the user is authenticated using Passport.js
      if (!req.isAuthenticated()) {
          // If not authenticated, redirect to the login page or initiate Google OAuth
          return res.redirect('/auth/google');
      }

      // If authenticated, proceed to the next middleware or route handler
      return next();
  } catch (error) {
      console.error(error);
      // Handle any errors that occur during authentication
      res.status(500).send('Internal Server Error');
  }
};


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

// ===========================  API FOR UPDATE THE USER INFORMATION =============================

route.put("/api/update_user", async (req, res) => {
  try {
    const user_data = {
      User_name: req.body.User_name,
      Email_Address: req.body.Email_Address,
    };
    const filter = { Email_Address: user_data.Email_Address };

    const update = { $set: { User_name: user_data.User_name } };

    const result = await user_signup.updateMany(filter, update);

    if (result.nModified > 0) {
      res.json({ message: "Users updated successfully" });
    } else {
      res.json({ message: "No matching users found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// =============================  API FOR DELETE THE SPECIFIC USER =====================================

route.delete("/api/delete_user", async (req, res) => {
  try {
    const emailToDelete = req.body.Email_Address;

    if (!emailToDelete) {
      return res
        .status(400)
        .json({ error: "Email_Address is required for deletion." });
    }

    const result = await user_signup.deleteMany({
      Email_Address: emailToDelete,
    });

    if (result.deletedCount > 0) {
      res.json({ message: "Users deleted successfully" });
    } else {
      res.json({ message: "No matching users found for deletion" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ================================  API for Login by using name and password  ============================
route.post("/login_user", async (req, res) => {
  try {
    const { User_name, Password } = req.body;
    const user = await user_signup.findOne({ User_name });

    if (!user) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid credentials" });
    }

    const isPasswordMatch = await bcrypt.compare(Password, user.Password);

    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user._id, User_name: user.User_name },
      process.env.KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      status: "success",
      message: "Login successful",
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// =====================================   middleware to verify the jsonwebtoken ===========================
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res
      .status(401)
      .json({ status: "error", message: "Unauthorized: Token is missing" });
  }

  jwt.verify(token, process.env.key, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ status: "error", message: "Unauthorized: Invalid token" });
    }

    req.user = decoded;
    next();
  });
};

// Route for fetching all users (admin access only)
route.get("/users", redirectLogin, (req, res) => {
  if (req.user.role === "admin") {
    res
      .status(200)
      .json({ status: "success", message: "List of all users", users });
  } else {
    res.status(403).json({
      status: "error",
      message: "Access denied. Insufficient privileges.",
    });
  }
});

// ======================  API to get the user data  ==========================================
route.get("/get_user_data", async (req, res) => {
  try {
    // Fetch all user data
    const data = await user_signup.find().exec();

    if (data.length > 0) {
      res.status(200).json({
        status: "success",
        message: "User data retrieved successfully",
        user: data,
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "No users found",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
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
const CALLBACK_URL = "http://localhost:2000/auth/google/callback";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user already exists in your database
        let user = await user_signup.findOne({ googleId: profile.id });

        if (!user) {
          // If the user doesn't exist, create a new user in the database
          user = new user_signup({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
          });
          await user.save();
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  // Save user information in the session
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  // Retrieve user information from the session
  done(null, obj);
  console.log(done(null, obj));
});

route.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

route.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // Successful authentication, redirect to dashboard or profile page
    res.redirect("/dashboard");
  }
);

route.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

/**
 * =====================================================================================================================
 * ==================================================  API FOR SHOPPING CART  ==========================================
 * =====================================================================================================================
 */

// ========================   FUNCTION for generating billNo =======================
function Generate_billno() {
  try {
    const startnumber = 100000;
    const EndNumber = 900000;

    const create_Number = Math.floor(startnumber + Math.random() * EndNumber);
    return create_Number;
  } catch (error) {
    console.log(error);
  }
}


route.post("/api/Shopping_Cart", async (req, res) => {
  try {
    const { CustomerName, ItemPurchase, CashBack, Payment_Mode } = req.body;

    const SaveCart_Data = await Cart_Schema.create({
      CustomerName,
      BillNo: Generate_billno(),
      ItemPurchase,
      CashBack,
      Payment_Mode,
      Current_Date: getCurrentDate(),
      Current_Time: getCurrentDateTime(),
    });

    console.log(SaveCart_Data);

    if (res.statusCode === 200) {
      res.json({ msg: "data saved succesfully" });
    } else {
      res.json({ msg: "problem to save Data" });
    }
  } catch (error) {
    console.log(error);
    if (res.status === 500) {
      res.json({ msg: "internal server error" });
    } else {
      res.json({ msg: "something went wrong" });
    }
  }
});


route.get('/api/GetCartData',async(req,res)=>{
  try {
    let getData = await Cart_Schema.findOne();
    let newData = []
    for(let i=0; i<getData.length; i++){
      newData.push(getData[i])
    }
    
    if(newData[1].CustomerName == 'rohit'){
      console.log('this is okkkk')
    }else{
      console.log('this come in false condition');
      }
    
    res.json({data:newData[1]})

  } catch (error) {
    console.log(error);
  }
})


/**
 * 
 * 
 * ======================   cart data controller ===========================
 * 
 */



route.get('/api/UserCartData',controller.GetUserData); // get user details by passing token



module.exports = route;
