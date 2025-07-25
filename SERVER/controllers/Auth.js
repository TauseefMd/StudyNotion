const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
require("dotenv").config();
const mailSender = require("../utils/mailSender");


//send OTP
exports.sendotp = async (req, res) => {
    try {
        //fetch email from request ki body
        const {email} = req.body;

        //check if the user alread registered or not
        const checkUserPresent = await User.findOne({email});

        //if user already exits, then return a response
        if(checkUserPresent){
            return res.status(401).json({
                success: false,
                message: "User already registered",
            })
        }

        //generate otp
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        })
        console.log("OTP generated: ", otp);

        //check unique otp or not
        let result = await OTP.findOne({otp: otp});

        while(result){
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            })

            result = await OTP.findOne({otp: otp});
        }

        const otpPayLoad = {email, otp};

        //create an entry for otp
        const otpBody = await OTP.create(otpPayLoad);
        console.log(otpBody);

        //return response successful
        res.status(200).json({
            success: true,
            message: 'OTP Sent Successfully',
            otp,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

//sign up
exports.signUp = async (req, res) => {
    try {
        //data fetch from request ki body
        const {firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp} = req.body;

        //validate krlo
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp ){
            return res.status(403),json({
                success: false,
                message: "All field are required!",
            })
        }

        //2 password match krlo
        if(password !== confirmPassword){
            return res.status(400),json({
                success: false,
                message: "Password and confirm Password value does not match, Please try again",
            })
        }

        //check user already exists or not
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success: false,
                message: "User already exists. Please sign in to continue.",
            })
        }

        //find most recent OTP stored for the user
        const recentotp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log("RecentOTP :" ,recentotp);

        //validate OTP
        if(recentotp.length === 0){
            //OTP not found
            return res.status(400).json({
                success: false,
                message: "OTP not found",
            });
        } else if(otp !== recentotp[0].otp) {
            //Invalid OTP 
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        //Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        //create the user
        let approved = "";
        approved === "Instructor" ? (approved=false) : (approved=true);

        //vreaye the additional profile for user
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            conatactNumber:null,
        })

        //entry create in DB
        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType,
            approved: approved,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })

        //return res
        return res.status(200).json({
            success: true,
            message: 'User registered Successfully',
            user,
        })
    } 
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'User cannot be registered. Please try again',
        })   
    }
};

//login
exports.login = async (req, res) => {
    try {
        //get data from request ki body
        const {email, password} = req.body;

        // validation data
        if(!email || !password){
            return res.status(403),json({
                success: false,
                message: "Either email or password is missing",
            })
        }

        // user check exits or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401),json({
                success: false,
                message: "User is not registered, Please signup first",
            })
        }

        // generate JWT, after password matching
        if(await bcrypt.compare(password, user.password)){
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: '2h',
            });
            user.token = token;
            user.password = undefined;

            // create cookie and send response
            const options = {
                expires : new Date(Date.now() + 3*24*60*60*1000),
                http: true
            }
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: 'Logged in successfully',
            })
        }
        else{
            res.status(401).json({
                success:false,
                message:'Password is incorrect!'
            })
        }
    } 
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Login Failure. Please try again',
        })   
    }
};

//change password
exports.changePassword = async (req, res) => {
    try {
        //get data from req body
        //get oldPassword, newPassword, confirmNewPassword
        const {email, oldPassword, newPassword, confirmNewPassword} = req.body;

        //validation
        if(!email || !oldPassword || !newPassword || !confirmNewPassword){
            res.status(401).json({
                success: false,
                message: 'All the field must be filled!',
            })
        }

        const existingUser = await User.findOne({email});
        if(!existingUser){
            return res.status(400),json({
                success: false,
                message: "User have created an account!",
            })
        }

        //2 password match krlo
        if(newPassword !== confirmNewPassword){
            return res.status(400),json({
                success: false,
                message: "Password and confirmPassword value does not match, Please try again",
            })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        //Update password in DB
        const updateUser = User.updateOne({email},
            {
                $set: {
                    password: hashedPassword
                },
            }
        )

        //send mail - Password Updated
        mailSender(
            email, 
            "Password Upadted", 
            `The password for the account ${email} has been updated. 

            Thanks!`
        )
        //return response
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Password not updated. Please try again',
        }) 
    }
}
