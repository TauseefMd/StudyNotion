const Tag = require("../models/Tags");

//Create Tag handler function
exports.createTag = async (req, res) => {
    try {
        //fetch data
        const {name, description} = req.body;

        //validation
        if(!name || !description){
            return res.status(403).json({
                success: false,
                message: 'Either Tag Name or Decription is missing',
            })
        }

        //DB me entry create 
        const tagDetails = await Tag.create({
            name: name,
            description: description,
        })
        console.log(tagDetails);

        //return response
        return res.status(200).json({
                success: true,
                message: 'Tag created successfully in Database',
            })
    } catch (error) {
        return res.status(500).json({
                success: false,
                message: error.message,
            });
    }
}

//Get All Tags
exports.showAlltags = async (req, res) => {
    try {
        const allTags = await Tag.find({}, {name:true, description:true});
        return res.status(200).json({
            success: true,
            message: 'All tags returned successfully',
            allTags,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}