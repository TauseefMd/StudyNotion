const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

//createCourse handler function
exports.createCourse = async (req, res) => {
    try {
        //fetch data
        const {courseName, courseDescription, whatYouWillLearn, price, tag, category, status, instructions} = req.body;

        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail || !category){
            return res.status(400).json({
                success: false,
                message: 'All fields are required!',
            });
        }
        if(!status || status === undefined){
            status = "Draft";
        }
        //check for Instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId,{
            accountType: "Instructor",
        });
        console.log(instructorDetails);
        //Todo: verify that userId and instructorDetails._id are same or different

        if(!instructorDetails){
            return res.status(404).json({
                success: false,
                message: 'Instructor Details not found!',
            });
        }

        //check given tag is valid or not
        const categoryDetails = await Category.findById(tag);
        if(!categoryDetails){
            return res.status(404).json({
                success: false,
                message: 'Category Details not found!',
            });
        }

        //Upload Image to Cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.Folder_Name);

        //create an entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag: tag,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
            status: status,
            instructions: instructions,
        })

        //add the new courses to the user schema of instructor
        await User.findByIdAndUpdate(
            {_id: instructorDetails,_id},
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            {new: true},
        )

        //update the category ka schema
        await Category.findByIdAndUpdate(
            {_id: category},
            {
                $push: {
                    course: newCourse._id,
                }
            },
            {new: true},
        )

        //return res
        return res.status(200).json({
            success: true,
            message: 'Course Created Successfully',
            data: newCourse,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create Course',
            error: error.message,
        })
    }
};

//getAllCourses handler function

exports.getAllCourses = async (req, res) => {
    try {
        //TODO: change the below statement incremently
        const allCourses = await Course.find({},
            {
                courseName: true,
                price: true,
                thumbnail: true,
                instructor: true,
                ratingAndReviews: true,
                studentsEnrolled: true,
            }
        )
            .populate("instructor")
            .exec();

        return res.status(200).json({
            success:true,
            message:'Data for all courses fetched successfully',
            data:allCourses,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Cannot Fetch course data',
            error:error.message,
        });
    }
};

//get CourseDetails exports
exports.getCourseDetails = async (req,res) => {
    try {
        //get id
        const {courseId} = req.body;

        //find course details
        const courseDetails = await Course.find({_id: courseId})
                                            .populate({
                                                path: "instructor",
                                                populate:{
                                                    path: "additionalDetails",
                                                },
                                            })
                                            .populate("category")
                                            .populate("ratingAndReviews")
                                            .populate({
                                                path:"courseContent",
                                                populate:{
                                                    path:"subSection",
                                                }
                                            })
                                            .exec();

        //validation
        if(!courseDetails){
            return res.status(400).json({
                succes: false,
                message: `Could not find the course with ${courseId}`,
            });
        }

        //return response
        return res.status(400).json({
            succes: true,
            message: 'Course details fetched successfully',
            data: courseDetails,
        });
    } catch (error) {
        console.log(error); 
        return res.status(500).json({
            succes: false,
            message: error.message,
        });
    }
}