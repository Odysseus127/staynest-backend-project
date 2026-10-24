import { Router } from "express";
import {
  listHotels,
  getHotel,
  listRoomsForHotel,
} from "../controllers/hotel.controller.js";

const router = Router();

// GET /api/hotels?city=Mumbai&sort=price_asc
router.get("/", listHotels);

// GET /api/hotels/:slug
router.get("/:slug", getHotel);

// GET /api/rooms/:id  (mounted separately — see server.js)
export const roomsRouter = Router();
roomsRouter.get("/:id", listRoomsForHotel);

export default router;