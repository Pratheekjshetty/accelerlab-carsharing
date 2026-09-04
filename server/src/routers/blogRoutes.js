import express from 'express'
import { addBlog,editBlog,listBlog,getBlog,getBlogById,getTotalBlogs} from '../controllers/blogControllers.js'
import authMiddleware from "../middleware/auth.js"
import multer from 'multer'

const blogRouter = express.Router();
//Image Storage Engine
const storage = multer.diskStorage({
    destination:"blog-uploads",
    filename:(req,file,cb)=>{
        return cb(null,`${Date.now()}${file.originalname}`)
    }
})

const upload = multer({storage:storage})
blogRouter.post('/add',authMiddleware,upload.single("image"),addBlog);
blogRouter.post('/edit',authMiddleware,upload.single("image"),editBlog);
blogRouter.get('/list',listBlog);
blogRouter.get('/total-blogs',getTotalBlogs);
blogRouter.get('/category/:category',getBlog)
blogRouter.get('/:id', getBlogById);

export default blogRouter ;