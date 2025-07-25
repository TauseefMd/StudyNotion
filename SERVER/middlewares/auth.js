const jwt  = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

//auth
exports.auth = async (req, res, next) => {
    try {
        //extra token
        const token = req.body.token || req.cookies.token || req.header("Authorisation").replace("Bearer ","");

        //if token missing then return response
        if(!token){
           return res.status(401).json({
            success: false,
            message:'Token is missing',
           });
        }

        //verify Token
        try {
            const decode = jwt.verify(token, process.config.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        } catch (error) {
            //verification - issue
            res.status(401).json({
                success: false,
                message:'Token is Invalid'
            })
        }

        next();
    } catch (error) {
       res.status(401).json({
            success: false,
            message:'Something went wrong while validating the token',
        }) 
    }
}


//isStudent
exports.isStudent = async (req, res, next) => {
    try {
        if(req.user.accountType !== 'Student'){
            return res.status(401).jsson({
                success:false,
                message:'This is a protected route for Student only!',
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:'User role cannot be verified, Please try again',
        })
    }
}

//isInstructur
exports.isInstructor = async (req, res, next) => {
    try {
        if(req.user.accountType !== 'Instructor'){
            return res.status(401).jsson({
                success:false,
                message:'This is a protected route for Instructur only!',
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:'User role cannot be verified, Please try again',
        })
    }
}

//isAdmin
exports.isAdmin = async (req, res, next) => {
    try {
        if(req.user.accountType !== 'Admin'){
            return res.status(401).jsson({
                success:false,
                message:'This is a protected route for Admin only!',
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:'User role cannot be verified, Please try again',
        })
    }
}

