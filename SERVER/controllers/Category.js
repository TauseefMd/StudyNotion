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

//category page details
exports.categoryPageDetails = async (req, res) => {
    try {
        //get categoryId
        const {categoryId} = req.body;

        //get courses for specified categoryId
        const selectedCategory = await Category.findById(categoryId)
                                            .populate("courses")
                                            .exec();
                        
        //validation
        if(!selectedCategory){
            return res.status(404).json({
                success: true,
                message: 'Data not found'
            });
        }

        //get course for different categories
        const differentCategories = await Category.find({ _id: {$ne: categoryId}})
                                            .populate("courses")
                                            .exec();

        //get top selling courses
        const allCategories = await Category.find().populate("course");
        const allCourses = allCategories.flatMap((category) => category.course);
        const mostSellingCourses = allCourses
            .sort((a,b) => b.sold-a.sold)
            .slice(0, 10);

        //return response
        return res.status(200).json({
            success: true,
            message: '',
            data: {
                selectedCategory,
                differentCategories,
                mostSellingCourses,
            },
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}