const mongoose = require("mongoose");

const create_user = new mongoose.Schema({
  User_name: {
    type: String,
    required: true,
  },
  Email_Address: {
    type: String,
    required: true,
  },
  Password: {
    type: String,
    required: true,
  },
  C_date: {
    type: Date,
    required: true,
  },
  C_time: {
    type: String,
    required: true,
  },
  jwt_token: {
    type: String,
    match: /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/,
  },
});

const User = mongoose.model('User_Signup', create_user , 'User_Signup');

module.exports = User;
