const { mongoose } = require("mongoose");
const Subject = require("../models/Subject");
const asyncHandler = require("express-async-handler");

// @desc Get Subjects for each Teacher
// @route GET /Subject/teacher/teacherId
// @access Everyone
const getSubjects = asyncHandler(async (req, res) => {
  if (!req?.params?.teacherId) {
    return res.status(400).json({ message: "Teacher ID Missing" });
  }
  const subjects = await Subject.find({
    teacher: req.params.teacherId,
  })
    .select("-students")
    .exec();
  if (!subjects) {
    return res.status(404).json({
      message: `No Subject(s) found`,
    });
  }
  res.json(subjects);
});

// @desc Get Subjects for each Student
// @route GET /subject/student/:studentId
// @access Everyone
const getSubjectsStudent = asyncHandler(async (req, res) => {
  if (!req?.params?.studentId) {
    return res.status(400).json({ message: "Student ID Missing" });
  }
  const subjects = await Subject.aggregate([
    {
      $lookup: {
        from: "teachers",
        localField: "teacher",
        foreignField: "_id",
        as: "teacher",
      },
    },
    {
      $unwind: "$teacher",
    },
    {
      $project: {
        students: {
          $in: [new mongoose.Types.ObjectId(req.params.studentId), "$students"],
        },
        semester: 1,
        year: 1,
        subject: 1,
        "teacher._id":1,
        "teacher.name": 1,
      },
    },
    {
      $match: { students: true },
    },
  ]);
  if (!subjects) {
    return res.status(404).json({
      message: `No Subject(s) found`,
    });
  }
  res.json(subjects);
});

// @desc Get All Subjects
// @route GET /subject/
// @access Everyone
const getAllSubjects = asyncHandler(async (req, res) => {
  if (!req?.params?.studentId) {
    return res.status(400).json({ message: "Student ID Missing" });
  }

  const subjects = await Subject.aggregate([
    {
      $lookup: {
        from: "teachers",
        localField: "teacher",
        foreignField: "_id",
        as: "teacher",
      },
    },
    {
      $unwind: "$teacher",
    },
    {
      $project: {
        semester: 1,
        year: 1,
        subject: 1,
        "teacher.name": 1,
        students: 1,
        department: 1,
        joined: {
          $in: [new mongoose.Types.ObjectId(req.params.studentId), "$students"],
        },
      },
    },
  ]);
  if (!subjects) {
    return res.status(404).json({
      message: `No Subject(s) found`,
    });
  }
  res.json(subjects);
});

// @desc Get Students for each subject
// @route GET /subject/students/:subjectId
// @access Private
const getStudentsList = asyncHandler(async (req, res) => {
  if (!req?.params?.subjectId) {
    return res
      .status(400)
      .json({ message: "Incomplete Request: Params Missing" });
  }

  const students = await Subject.findById(req.params.subjectId)
    .select("students")
    .populate({ path: "students", select: "name" })
    .exec();
  if (!students?.students) {
    return res.status(400).json({ message: "No Students Found" });
  }
  res.json(students.students);
});

// @desc Get Subject
// @route GET /Subject
// @access Everyone
const getSubject = asyncHandler(async (req, res) => {
  if (!req?.params?.subjectId) {
    return res
      .status(400)
      .json({ message: "Incomplete Request: Params Missing" });
  }
  const subject = await Subject.findOne({
    _id: req.params.subjectId,
  })
    .populate({ path: "teacher", select: "name" })
    .populate({ path: "students", select: "name" })
    .exec();
  if (!subject) {
    return res.status(404).json({
      message: `No Subject(s) found`,
    });
  }
  res.json(subject);
});

// @desc Add Subject
// @route POST /Subject
// @access Private
const addSubject = asyncHandler(async (req, res) => {
  const { department, semester, year, subject, students, teacher } = req.body;

  // Confirm Data
  if (!department || !subject || !semester || !year || !students || !teacher) {
    return res
      .status(400)
      .json({ message: "Incomplete Request: Fields Missing" });
  }

  // Check for Duplicates
  const duplicate = await Subject.findOne({
    department: req.body.department,
    subject: req.body.subject,
    students: req.body.students,
    teacher: req.body.teacher,
  })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Subject already exists" });
  }

  const SubjectObj = {
    department,
    semester,
    subject,
    year,
    students,
    teacher,
  };

  // Create and Store New teacher
  const record = await Subject.create(SubjectObj);

  if (record) {
    res.status(201).json({
      message: `New Subject ${req.body.subject} added `,
    });
  } else {
    res.status(400).json({ message: "Invalid data received" });
  }
});

// @desc Update Subject
// @route PATCH /Subject
// @access Private
const updateStudents = asyncHandler(async (req, res) => {
  const { id, students } = req.body;

  // Confirm Data
  if (!id || !students) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Find Record
  const record = await Subject.findById(id).exec();

  if (!record) {
    return res.status(404).json({ message: "Subject doesn't exist" });
  }

  record.students = students;

  const save = await record.save();
  if (save) {
    res.json({ message: "Updated" });
  } else {
    res.json({ message: "Save Failed" });
  }
});

// @desc Delete Subject
// @route DELETE /Subject
// @access Private
const deleteSubject = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Subject ID required" });
  }

  const record = await Subject.findById(id).exec();

  if (!record) {
    return res.status(404).json({ message: "Subject not found" });
  }

  await record.deleteOne();

  res.json({ message: `${subject} deleted` });
});

module.exports = {
  addSubject,
  getAllSubjects,
  getSubjects,
  getSubjectsStudent,
  getStudentsList,
  getSubject,
  updateStudents,
  deleteSubject,
};
