const express = require("express");
const router  = express.Router();

//Import the controllers
const {login, signup, sendotp, changePassword} = require("../controllers/Auth");
const {resetPassword, resetPasswordToken} = require("../controllers/ResetPassword");

const {auth} = require("../middlewares/auth");

// Routes for Login, Signup, and Authentication

router.post("/login", login);
router.post("/signup", signup);
router.post("/sendotp", sendotp);
router.post("/changepassword", auth, changePassword);

//Reset Password
router.post("/reset-password-token", resetPasswordToken);
router.post("/reset-password", resetPassword);

model.exports = router;