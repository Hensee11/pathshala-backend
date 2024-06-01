const mongoose = require("mongoose");
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI,{family:4});
  } catch (err) {
    // console.log(err);
  }
};

module.exports = connectDB;
