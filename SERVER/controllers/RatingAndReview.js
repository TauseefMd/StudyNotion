const RatingAndReviews = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

//createRating
exports.createRating = async (req, res) => {
    try {
        //get user id
        const userId = req.user.id;

        //fetch data from req body
        const {rating, review, courseId} = req.body;

        //check if user is enrolled or not
        const courseDetails = await Course.findOne(
            {
                _id: courseId,
                studentsEnrolled: {$elemMatch: {$eq: userId}},
            }
        );
        if(!courseDetails){
            return res.status(404).json({
                success: false,
                message: 'Student is not enrolled in the courses',
            });
        }
        
        //check if user already reviewed the course
        const alreadyReviewed = await RatingAndReviews.findOne({
            user: userId,
            course: courseId,
        })
        if(alreadyReviewed){
            return res.status(404).json({
                success: false,
                message: 'Course already reviewed by User',
            }); 
        }

        //create rating and reviews
        const ratingReview = await ratingReview.create({
            rating, review,
            course: courseId,
            user: userId,
        });

        //update course with this rating/reviews
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId},
            {
                $push:{
                    ratingAndReviews: ratingReview._id,
                }
            },
            {new: true}
        );
        console.log(updatedCourseDetails); 

        //return response
        return res.status(200).json({
            success: true,
            message: 'Rating and revied created successfully',
            ratingReview,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}


//getAverageRating
exports.getAverageRating = async (req, res) => {
    try {
        //get course rating
        const courseId = req.body.courseId;

        //calculate avegrage rating
        const result = await RatingAndReviews.aggregate([
            {
                $match:{
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: {$avg : "$rating"},
                }
            }
        ]);

        //return rating 
        if(result.length > 0){
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating,
            })
        }

        //if no rating/Reviews exist
        return res.status(200).json({
            success: true,
            message: 'Average rating is 0, no rating till now',
            averageRating: 0,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

//getAllRating
exports.getAllRating = async (req, res) => {
    try {
        const allReviews = await RatingAndReviews.find({})
                                .sort({rating: "desc"})
                                .populate({
                                    path: "user",
                                    select:"firstName lastName email image",
                                })
                                .populate({
                                    path: "course",
                                    select: "courseName"
                                })
                                .exec();
                    
        return res.status(200).json({
            success: true,
            message: 'All reviews fetched successfully',
            data: allReviews,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}