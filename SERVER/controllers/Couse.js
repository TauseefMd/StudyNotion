const Course = require("../models/Course");
const Tag = require("../models/Tags");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

//createCourse handler function
exports.createCourse = async (req, res) => {
    try {
        //fetch data
        const {courseName, courseDescription, whatYouWillLearn, price, tag} = req.body;

        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag){
            return res.status(400).json({
                success: false,
                message: 'All fields are required!',
            });
        }

        //check for Instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log(instructorDetails);
        //Todo: verify that userId and instructorDetails._id are same or different

        if(!instructorDetails){
            return res.status(404).json({
                success: false,
                message: 'Instructor Details not found!',
            });
        }

        //check given tag is valid or not
        const tagDetails = await Tag.findById(tag);
        if(!tagDetails){
            return res.status(404).json({
                success: false,
                message: 'Tags Details not found!',
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
            tag: tagDetails._id,
            thumbnail: thumbnailImage.secure_url,
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

        //update the tag ka schema
        await Tag.findByIdAndUpdate(
            {tag},
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

exports.showAllCourses = async (req, res) => {
    try {
        //TODO: change the below statement incremently
        const allCourses = await Course.find({});

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
        })
    }
}