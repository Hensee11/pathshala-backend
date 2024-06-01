const express = require("express");
const router = express.Router();
const subjectController = require("../controllers/subjectController");

router.route("/").post(subjectController.addSubject);
router.route("/manage/:studentId").get(subjectController.getAllSubjects);

router.route("/students/:subjectId").get(subjectController.getStudentsList);
router.route("/teacher/:teacherId").get(subjectController.getSubjects);
router.route("/student/:studentId").get(subjectController.getSubjectsStudent);

router
  .route("/:subjectId")
  .get(subjectController.getSubject)
  .patch(subjectController.updateStudents)
  .delete(subjectController.deleteSubject);

module.exports = router;
