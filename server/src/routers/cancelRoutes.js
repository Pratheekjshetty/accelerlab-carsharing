import express from 'express';
import { cancelBooking, getCancellations, updateCancellationStatus, deleteCancellationStatus, deleteCancellation } from '../controllers/cancelControllers.js';

const cancelRouter = express.Router();
cancelRouter.post('/cancel-booking', cancelBooking);
cancelRouter.get('/cancellations', getCancellations);
cancelRouter.post('/update-status', updateCancellationStatus);
cancelRouter.post('/delete-status', deleteCancellationStatus);  
cancelRouter.delete('/delete-cancellation', deleteCancellation);

export default cancelRouter;
  