//Import the required modules
const express = require("express");
const router = express.Router();

//Import the controllers
const {createCourse, getAllCourses, getCourseDetails} = require("../controllers/Course");
const {showAllCategories, createCategory, categoryPageDetails} = require("../controllers/Category");
const {createSection, updateSection, deleteSection} = require("../controllers/Section");
const {createSubSection, updateSubSection, deleteSubSection} = require("../controllers/Subsection");
const {createRating, getAverageRating, getAllRating} = require("../controllers/RatingAndReview");
const {auth, isInstructor, isStudent, isAdmin} = require("../middlewares/auth");

// Courses can Only be Created by Instructors
router.post("/createCourse", auth, isInstructor, createCourse);
//Add a Section to a Course
router.post("/addSection", auth, isInstructor, createSection);
//Update a Section
router.post("/updateSection", auth, isInstructor, updateSection);
//Delete aSection
router.post("/deleteSection", auth, isInstructor, deleteSection);
// Edit sub section
router.post("/updateSubSuction", auth, isInstructor, updateSubSection);
// Delete Sub Section
router.post("/deleteSubSection", deleteSubSection);
// Add a Sub Section to a Section
router.post("/addSubSection", auth, isInstructor, createSubSection);
//Get all Registered Courses
router.get("/getAllCourses", getAllCourses);
//Get Details for a Specific Courses
router.post("/getCourseDetails", getCourseDetails);


//Category can only be created by Admin
router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategories", showAllCategories);
router.post("/getCategoryPageDetails", categoryPageDetails);


//Rating and Review
router.post("/createRating", auth, isStudent, createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRating);

module.exports = router;
