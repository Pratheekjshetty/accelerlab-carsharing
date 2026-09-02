import express from 'express';
import multer from 'multer';
import { applyDriver, getApplications, updateApplicationStatus, deleteApplicationStatus, deleteApplication, getDriverByUserId, adminEditDriver } from '../controllers/driverControllers.js';
import { authMiddleware } from '../middleware/auth2.js';

const driverRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

driverRouter.post('/apply', authMiddleware, upload.fields([
  { name: 'driversLicense', maxCount: 1 },
  { name: 'proofOfAddress', maxCount: 1 },
]), applyDriver);
driverRouter.get('/applications',getApplications);
driverRouter.post('/update-role', updateApplicationStatus);
driverRouter.post('/delete-role', deleteApplicationStatus);
driverRouter.delete('/delete-application', deleteApplication);
driverRouter.get('/admin-edit/:userId', getDriverByUserId); 
driverRouter.put('/admin-edit/:userId', upload.fields([
  { name: 'driversLicense', maxCount: 1 },
  { name: 'proofOfAddress', maxCount: 1 },
]), adminEditDriver);

export default driverRouter;
