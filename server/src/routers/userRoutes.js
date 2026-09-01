import express from 'express'
import {loginUser,registerUser,editUser,getUser,getUserById,getCount,listActiveUsersByRole,deactivateUser,addUser,adminEditUser} from '../controllers/userControllers.js'
import authMiddleware from '../middleware/auth.js';
import multer from 'multer'

const userRouter = express.Router()

//Image Storage Engine
const storage = multer.diskStorage({
    destination: "user-uploads",
    filename: (req, file, cb) => {
        return cb(null,`${Date.now()}${file.originalname}`)
    }
});

const upload = multer({storage:storage})
userRouter.post('/register',upload.single('image'),registerUser);
userRouter.post('/login',upload.none(),loginUser);
userRouter.put('/edit-user', authMiddleware, upload.single('image'), editUser);
userRouter.get('/get-user', authMiddleware, getUser);
userRouter.get('/get-user-by-id/:userId', getUserById);
userRouter.get('/get-count',getCount);
userRouter.get('/list-users/:role', listActiveUsersByRole);
userRouter.put('/deactivate/:userId', deactivateUser);
userRouter.post('/add', upload.single('image'), addUser);
userRouter.put('/admin-edit/:userId',upload.single('image'),adminEditUser);

export default userRouter;