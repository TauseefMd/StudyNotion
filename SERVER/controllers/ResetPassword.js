const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

//reset Password Token
exports.resetPasswordToken = async (req, res) => {
    try {
        //get email from req body
        const email = req.body.email;
        
        //check user for this email, email validation
        const existingUser = await User.findOne({email});

        if(!existingUser){
            return res.status(402).json({
                success: false,
                message: 'Your Email is not registered with us.'
            });
        }

        //generate token 
        const token = crypto.randomUUID();

        //update user by adding token and expiration time
        const updatedDetails = await User.findOne(
            {email:email},
            {
                token: token,
                resetPasswordExpires: Date.now() + 5*60*1000,
            },
            {new:true}
        )

        //cereate url
        const url = `http://localhost:3000/update-password/${token}`;

        //send mail containing the URL
        await mailSender(email, "Password Reset Link", `Password Reset Link: ${url}`);
        
        //return response 
        return res.json({
            success: true,
            message: 'Email sent successfully, Please check mail and check password'
        });
    } catch (error) {
        console.error(errror);
        return res.status(500).json({
            success: false,
            message:'Something went wrong while sending reset password mail'
        });
        
    }
}


//reset Password 
exports.resetPassword = async (req, res) => {
    try {
        //data fetch
        const {password, confirmPassword, token} = req.body

        //validation
        if(password !== confirmPassword){
            return res.status(403).json({
                success: false,
                message: 'Password not matching!'
            });
        }

        //get userdetails from db using token
        const userdetails = await User.findOne({token: token});

        //if no entry - invalid token
        if(!userdetails){
            return res.status(403).json({
                success: false,
                message: 'Token Invalid!'
            });
        };

        //token time check
        if(userdetails.resetPasswordExpires < Date.now()){
            return res.status(403).json({
                success: false,
                message: 'Token is expired, Please regenerate your token!'
            });
        };

        //hash pwd
        const hashedPassword = bcrypt.hash(password, 10);

        //pwd update
        await User.findOneAndUpdate(
            {token: token},
            {password: hashedPassword},
            {new:true},
        ); 

        //resturn response
        return res.status(403).json({
            success: true,
            message: 'Password reset successful!',
        });
    } catch (error) {
        console.error(errror);
        return res.status(500).json({
            success: false,
            message:'Something went wrong while reset password!'
        });
    }
        
}