const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req, res) => {
    try {
        //data fetch
        const {sectionName, courseId} = req.body;

        //data validation
        if(!sectionName || !courseId){
            return res.status(403).json({
                success: false,
                message: 'Missing Properties',
            })
        }

        //create section
        const newSection = await Section.create({sectionName});
        
        //update course with section ObjectID
        const updatedCourseDetails = await Course.findByIdAndUpdate(courseId,
            {
                $push:{
                    courseContent: newSection._id,
                }
            },
            {new: true},
        );
        //HW: use populate to replace sections/sub-sections both in the updatedCourseDetails
        //return response
        return res.status(200).json({
            success: true,
            message: 'Section created successfully',
            updatedCourseDetails,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to create section, please try again',
            error: error.message,
        })
    }
}

exports.updateSection = async (req, res) => {
    try {
        
        //data input
        const {sectionName, sectionId} = req.body;

        //data validation
        if(!sectionName || !sectionId){
            return res.status(403).json({
                success: false,
                message: 'Missing Properties',
            })
        }

        //update data
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new:true});

        //return res
        return res.status(200).json({
            success: true,
            message: 'Section updated successfully',
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to update section, please try again',
            error: error.message,
        })
    } 
}

exports.deleteSection = async (req, res) => {
    try {
        //fetch section Id - assuming that we are sending Id in params
        const {sectionId, courseId} = req.body;

        //find by Id and delete
        await Section.findByIdAndDelete(sectionId);

        //Todo[Testing]: do we need to delete the entry from the courses schema??
        await Course.findByIdAndDelete(courseId);

        //return response
        return res.status(200).json({
            success: true,
            message: 'Section deleted successfully',
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to delete section, please try again',
            error: error.message,
        })
    }
}