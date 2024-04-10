const express = require('express');
const cart_Schema = require('../DB_schema/cart_schema');


module.exports = async = (req,res) =>{
    try {

        let data = await cart_Schema.find().exec();
        
    } catch (error) {
        console.log(error);
    }
}

