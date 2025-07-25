const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async (req, res) => {
    try {
        //fetch data
        const {dateOfBirth="", about="", contactNumber, gender} = req.body;
        //get userId
        const id = req.user.id;

        //validation
        if(!contactNumber || !gender || !id){
            return res.status(400).json({
                success: false,
                message: 'All field are required!',
            });
        }

        //find profile
        const UserDetails = await User.findById(id);
        const profileId = UserDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        //update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.gender = gender;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();

        //return response
        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            profileDetails, 
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to update profile, please try again',
            error: error.message,
        })
    }
}

//delete Account
//Explore -? How can we schedule this deletion 
exports.deleteAccount = async (req, res) => {
    try {
        //fetch ID
        const id = req.user.id;

        //Validation
        const UserDetails = await User.findById({id});
        if(!UserDetails){
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        //delete profile
        await Profile.findByIdAndDelete({_id:UserDetails.additionalDetails});

        //TODO: Uneroll user from all enrolled courses

        //delete user
        await User.findByIdAndDelete({_id:id});

        //return response
        return res.status(200).json({
            success: true,
            message: 'Profile deleted successfully'
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to delete profile, please try again',
            error: error.message,
        });
    }
}

exports.getAllUserDetails = async (req, res) => {
    try {
        //fetch Id
        const id = req.user.id;

        //validation and get user details
        const userdetails = await User.findById(id).populate("additinalDetails").exec();
        console.log(userdetails);

        //return response
        return res.status(200).json({
            success: true,
            message: 'User data fetched successfully',
            userdetails,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to get User details, please try again',
            error: error.message,
        });
    }
}

exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};

exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      const userDetails = await User.findOne({
        _id: userId,
      })
        .populate("courses")
        .exec()
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};