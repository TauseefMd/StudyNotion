const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

//Create SubSection
exports.createSubSection = async (req, res) => {
    try {
        //fetch data from req body
        const {sectionId, title, timeDuration, description} = req.body;

        //extract file/video
        const video = req.files.videoFile;

        //validation
        if(!sectionId || !title || !timeDuration || !description || !video){
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }

        //upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
        console.log(uploadDetails);

        //create a sub section
        const subSectionDetails = await SubSection.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            videoUrl: uploadDetails.secure_url,
        })

        //update section with this sub section ObjectId
        const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},
            {
                $push: {
                    subSection: subSectionDetails._id,
                },
            },
            {new:true}
        ).populate("subSection");

        console.log(updatedSection);
        //return res
        return res.status(200).json({
            success: true,
            message: 'Sub-Section created successfully!',
            updatedSection,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
}

//updateSubSection
exports.updateSubSection = async (req, res) => {
    try {
        //data fetch
        const {subSectionId, title, timeDuration, description} = req.bedy;

        //validation
        if(!subSectionId) {
            return res.status(403).json({
                    success: false,
                    message: 'Missing Properties',
                });
        }

        //update data
        const subsection = await SubSection.findByIdAndUpdate(subSectionId, {
            title : title,
            timeDuration: timeDuration,
            description:description,
        }, {new:true});
        
        //return res
        return res.status(200).json({
            success: true,
            message: 'SubSection updated successfully',
            subsection,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to update subsection, please try again',
            error: error.message,
        })
    }
}

//deleteSubSection
exports.deleteSubSection = async (req, res) => {
    try {
        //fetch section Id - assuming that we are sending Id in params
        const {subSecectionId} = req.params;

        //find by Id and delete
        await SubSection.findByIdAndDelete(subSecectionId);

        //Todo[Testing]: do we need to delete the entry from the courses schema??

        //return response
        return res.status(200).json({
            success: true,
            message: 'Section deleted successfully',
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to delete subsection, please try again',
            error: error.message,
        })
    }
}