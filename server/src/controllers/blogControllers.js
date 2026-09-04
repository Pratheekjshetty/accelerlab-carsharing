import blogModel from '../models/blogModels.js'
import fs from 'fs'

//add blog
const addBlog = async(req,res)=>{
    if (!req.userId) {
        return res.json({ success: false, message: "User ID not provided" });
    }
    let image_filename = `${req.file.filename}`;
    const blog = new blogModel({
        userId: req.userId,
        title:req.body.title,
        description:req.body.description,
        category:req.body.category,
        image:image_filename
    })
    try{
        await blog.save();
        res.json({success:true,message:"Blog Added Successfully"});
    } catch(err){
        console.log(err)
        res.json({success:false,message:"Error while adding the Blog"})
    }
}

//edit blog
const editBlog = async (req, res) => {
    try {
        const blogId = req.body.id;
        if (!blogId) {
            return res.json({ success: false, message: "Blog ID not provided" });
        }
        const blog = await blogModel.findById(blogId);
        if (!blog) {
            return res.json({ success: false, message: "Blog not found" });
        }
        // If a new image is uploaded, replace the old one
        if (req.file) {
            console.log("Replacing image:", blog.image);
            fs.unlink(`blog-uploads/${blog.image}`, () => {});
            blog.image = `${req.file.filename}`;
        }
        // Update other car details
        blog.title = req.body.title || blog.title;
        blog.description = req.body.description || blog.description;
        blog.category = req.body.category || blog.category;
        await blog.save();
        res.json({ success: true, message: "Blog Updated Successfully" });
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: "Error" });
    }
};

//list blog
const listBlog = async (req, res) => {
    try{
        const blogs=await blogModel.find({});
        res.json({success:true,data:blogs})
    }catch(err){
        console.log(err)
        res.json({success:false,message:"Error"})
    }
};

//get blog using category
const getBlog = async (req, res) => {
    const { category } = req.params;
    try {
        const blogs = await blogModel.find({ category });
        res.json({ success: true, data: blogs});
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching blogs by category' });
    }
}

// fetch single blog by ID
const getBlogById = async (req, res) => {
    const { id } = req.params;
    try {
        const blog = await blogModel.findById(id);
        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }
        res.json({ success: true, data: blog });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching blog by ID' });
    }
};

// get total blogs
const getTotalBlogs = async (req, res) => {
    try {
        const totalBlogs = await blogModel.countDocuments();
        res.json({ success: true, totalBlogs: totalBlogs });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Error fetching total blogs count' });
    }
};

export {addBlog,editBlog,listBlog,getBlog,getBlogById,getTotalBlogs}