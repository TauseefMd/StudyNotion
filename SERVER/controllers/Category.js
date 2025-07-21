const Category = require("../models/Category");

//Create Category handler function
exports.createCategory = async (req, res) => {
    try {
        //fetch data
        const {name, description} = req.body;

        //validation
        if(!name || !description){
            return res.status(403).json({
                success: false,
                message: 'Either Category Name or Decription is missing',
            })
        }

        //DB me entry create 
        const categoryDetails = await Category.create({
            name: name,
            description: description,
        })
        console.log(categoryDetails);

        //return response
        return res.status(200).json({
                success: true,
                message: 'Category created successfully in Database',
            })
    } catch (error) {
        return res.status(500).json({
                success: false,
                message: error.message,
            });
    }
}

//Get All Categories
exports.showAllCategories = async (req, res) => {
    try {
        const allCategories = await Category.find({}, {name:true, description:true});
        res.status(200).json({
            success: true,
            message: 'All tags returned successfully',
            allCategories,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}