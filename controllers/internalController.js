const { default: mongoose } = require("mongoose");
const Internal = require("./../models/Internal");
const asyncHandler = require("express-async-handler");

// @desc Get Internal Result
// @route GET /internal/:subject
// @access Everyone
const getInternal = asyncHandler(async (req, res) => {
  if (!req?.params?.subject) {
    return res
      .status(400)
      .json({ message: "Incomplete Request: Params Missing" });
  }
  const internal = await Internal.findOne({
    subject: req.params.subject,
  }).exec();
  if (!internal) {
    return res.status(404).json({
      message: "No Existing Record(s) found. Add New Record.",
    });
  }
  res.json(internal);
});

// @desc Get Internal Result
// @route GET /internal/student/:studentId
// @access Everyone
// const getInternalStudent = asyncHandler(async (req, res) => {
//   if (!req?.params?.studentId) {
//     return res
//       .status(400)
//       .json({ message: "Incomplete Request: Params Missing" });
//   }
//   const internal = await Internal.aggregate([
//     {
//       $lookup: {
//         from: "subject",
//         localField: "subject",
//         foreignField: "_id",
//         as: "subject",
//       },
//     },
//     {
//       $unwind: "$subject",
//     },
//     {
//       $project: {
//         marks: {
//           $filter: {
//             input: "$marks",
//             as: "mark",
//             cond: {
//               $eq: [
//                 "$mark._id",
//                 new mongoose.Types.ObjectId(req.params.studentId),
//               ],
//             },
//           },
//         },
//         "subject.subject": 1,
//       },
//     },
//     {
//       $unwind: "$marks",
//     },
//   ]);
//   if (!internal.length) {
//     return res.status(404).json({
//       message: "No Records Found.",
//     });
//   }
//   res.json(internal);
// });
const getInternalStudent = asyncHandler(async (req, res) => {
  if (!req?.params?.studentId) {
    return res
      .status(400)
      .json({ message: "Incomplete Request: Params Missing" });
  }

  try {
    const internal = await Internal.aggregate([
      {
        $match: {
          "marks._id": new mongoose.Types.ObjectId(req.params.studentId),
        },
      },
      {
        $unwind: "$marks",
      },
      {
        $match: {
          "marks._id": new mongoose.Types.ObjectId(req.params.studentId),
        },
      },
      {
        $lookup: {
          from: "subjects", // Assuming "subject" is the name of the collection
          localField: "subject",
          foreignField: "_id",
          as: "subjectInfo",
        },
      },
      {
        $unwind: "$subjectInfo",
      },
      {
        $project: {
          marks: 1,
          subject: "$subjectInfo.subject", // Include the subject name
        },
      },
    ]);

    if (!internal.length) {
      return res.status(404).json({
        message: "No Records Found.",
      });
    }

    res.json(internal);
  } catch (err) {
    // Handle errors appropriately
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// @desc Add Internal
// @route POST /Internal
// @access Private
const addInternal = asyncHandler(async (req, res) => {
  const { subject, marks } = req.body;

  // Confirm Data
  if (!subject || !marks) {
    return res
      .status(400)
      .json({ message: "Incomplete Request: Fields Missing" });
  }
  // Check for Duplicates
  const duplicate = await Internal.findOne({
    subject: req.params.subject,
  })
    .lean()
    .exec();
  if (duplicate) {
    return res.status(409).json({ message: "Internal record already exists" });
  }

  const InternalObj = {
    subject,
    marks,
  };
  // Create and Store New teacher
  const record = await Internal.create(InternalObj);
  if (record) {
    res.status(201).json({
      message: `Internal Record  Added`,
    });
  } else {
    res.status(400).json({ message: "Invalid data received" });
  }
});

// @desc Update Internal
// @route PATCH /Internal
// @access Private
const updateInternal = asyncHandler(async (req, res) => {
  const { id, subject, marks } = req.body;

  // Confirm Data
  if (!id || !subject || !marks) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Find Record
  const record = await Internal.findById(id).exec();
  if (!record) {
    return res.status(404).json({ message: "Internal record doesn't exist" });
  }

  // Check for duplicate
  const duplicate = await Internal.findOne({
    subject: req.params.subject,
  })
    .lean()
    .exec();

  // Allow Updates to original
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate Username" });
  }
  record.subject = subject;
  record.marks = marks;
  const save = await record.save();
  if (save) {
    res.json({
      message: ` Internal Record Updated`,
    });
  } else {
    res.json({ message: "Save Failed" });
  }
});

// @desc Delete Teacher
// @route DELETE /Teacher
// @access Private
const deleteInternal = asyncHandler(async (req, res) => {
  const id = req.params.subject;

  if (!id) {
    return res.status(400).json({ message: "Internal ID required" });
  }

  const record = await Internal.findById(id).exec();
  if (!record) {
    return res.status(404).json({ message: "Internal Record not found" });
  }

  await record.deleteOne();
  res.json({
    message: `Internal Record deleted`,
  });
});

module.exports = {
  getInternal,
  getInternalStudent,
  addInternal,
  updateInternal,
  deleteInternal,
};
