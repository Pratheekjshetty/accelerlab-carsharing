import express from 'express'
import { addCar,listCar,listActiveCars,removeCar,deactivateCar,editCar,getTotalCars} from '../controllers/carControllers.js'
import multer from 'multer'

const carRouter = express.Router();
//Image Storage Engine
const storage = multer.diskStorage({
    destination:"uploads",
    filename:(req,file,cb)=>{
        return cb(null,`${Date.now()}${file.originalname}`)
    }
})

const upload = multer({storage:storage})
carRouter.post('/add',upload.single("image"),addCar)
carRouter.get('/list',listCar)
carRouter.get('/listactive-car',listActiveCars)
carRouter.post('/remove',removeCar)
carRouter.put('/deactivate-car',deactivateCar)
carRouter.put('/edit',upload.single("image"),editCar)
carRouter.get('/total-cars', getTotalCars);

export default carRouter;