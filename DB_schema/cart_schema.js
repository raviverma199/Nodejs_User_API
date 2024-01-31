const mongoose = require("mongoose");

const cart = new mongoose.Schema({
  CustomerName: {
    type: String,
    required: true,
  },
  BillNo: {
    type: String,
    required: true,
    unique: true,
  },
  ItemPurchase: {
    type: Number,
    required: true,
  },
  CashBack: {
    type: Number,
    required: false,
    default: "0",
  },
  Payment_Mode: {
    type: String,
    required: false,
  },
  Current_Date: {
    type: String,
    required: false,
  },
  Current_Time: {
    type: String,
    required: false,
  },
});


const cart_Schema = mongoose.model("Customer_Shopping_Cart",cart,"Customer_Shopping_Cart");

module.exports = cart_Schema