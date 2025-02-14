const mongoose = require("mongoose");

// Student Details
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  course: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  semester: {
    type: String,
    required: true,
    default:"I"
  },
  password: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Student", studentSchema);
