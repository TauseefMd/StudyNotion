const express = require("express");
const router = express.Router();

const {auth} = require("../middlewares/auth");
const {deleteAccount, updateProfile, getAllUserDetails, updateDisplayPicture, getEnrolledCourses} = require("../controllers/Profile");

//Profile routes
router.delete("/deleteProfile", deleteAccount);
router.put("/updateProfile", auth, updateProfile);
router.get("/getUserDetails", auth, getAllUserDetails);

router.get("/getEnrolledCourses", auth, getEnrolledCourses);
router.put("/updateDisplayPicture", auth, updateDisplayPicture);

module.exports = router;