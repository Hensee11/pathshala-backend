const mongoose = require("mongoose");

// Internal Result of Students
const internalSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  marks: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
      },
      name: String,
      test: {
        type: Number,
        required: true,
      },
      seminar: {
        type: Number,
        required: true,
      },
      assignment: {
        type: Number,
        required: true,
      },
      attendance: {
        type: Number,
        required: true,
      },
      total: {
        type: Number,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("Internal", internalSchema);
