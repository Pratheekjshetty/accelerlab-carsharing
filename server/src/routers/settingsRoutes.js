import express from 'express'
import {getSettings,addSetting,updateSetting,deleteSetting} from '../controllers/settingsControllers.js'

import multer from 'multer';
import path from 'path';

const settingsRouter = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(
            null,
            `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`
        );
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg','image/jpg','image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error('Only JPG, JPEG or PNG images are allowed'),
            false
        );
    }
};

const upload = multer({storage: storage,fileFilter: fileFilter,
    limits: {
        fileSize: 25 * 1024 * 1024
    }
});
settingsRouter.get('/list', getSettings)
settingsRouter.post('/add', upload.single('image'), addSetting)
settingsRouter.put('/update/:settingId', upload.single('image'), updateSetting)
settingsRouter.delete('/delete/:settingId', deleteSetting)

export default settingsRouter