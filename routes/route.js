const express = require('express')
const route = express.Router();
const connection = require('../DB/connection');

// =========== User signup schema ==============
const user_signup = require('../DB_schema/User_signup')

// ===========  Get route ====================
route.get('/',async(req,res)=>{
    try {
        res.send('200')
    } catch (error) {
        console.log(error);
    }
})

module.exports = route