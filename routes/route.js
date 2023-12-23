const express = require('express')
const route = express.Router();
const connection = require('../DB/connection')



route.get('/',async(req,res)=>{
    try {
        res.render('/landing_page')
    } catch (error) {
        console.log(error);
    }
})

module.exports = route