const express = require("express");
const router = express.Router();
const authController = require("./../controllers/authController");

router.route("/login/teacher").post(authController.teacherLogin);
router.route("/login/student").post(authController.studentLogin);
router.route("/reset/password").post(authController.sendResetPasswordEmail);

//? Incase of JWT
//   .route("/logout")
//   .post(authController.logout);

module.exports = router;
