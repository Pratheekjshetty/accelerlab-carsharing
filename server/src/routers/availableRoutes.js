import express from "express"
import { availableBooking,listadminBooking} from "../controllers/availableControllers.js"

const availableRouter = express.Router();
availableRouter.post("/update",availableBooking);
availableRouter.get("/admin-booked-cars", listadminBooking);

export default availableRouter;
