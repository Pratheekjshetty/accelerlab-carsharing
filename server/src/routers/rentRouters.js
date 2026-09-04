import express from "express"
import authMiddleware1 from "../middleware/auth1.js"
import { rentBooking,verifyBooking,userBooking,listBooking,updateStatus,getWeekBookings,getCarBookingPercentages} from "../controllers/rentControllers.js"

const rentRouter = express.Router();
rentRouter.post("/rent",authMiddleware1,rentBooking);
rentRouter.post("/verify",verifyBooking);
rentRouter.post("/userbooking",authMiddleware1,userBooking);
rentRouter.get("/listbooking",listBooking);
rentRouter.post("/status",updateStatus);
rentRouter.get("/week-bookings",getWeekBookings);
rentRouter.get("/percentages",getCarBookingPercentages);

export default rentRouter;