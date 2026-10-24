import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import {
  stats, bookings, users, patchBookingStatus,
  postHotel, patchHotel, removeHotel,
  postRoom, patchRoom, removeRoom,
} from "../controllers/admin.controller.js";

const router = Router();

// Every route in this file requires BOTH auth + admin role
router.use(requireAuth, requireAdmin);

// Dashboard
router.get("/stats", stats);

// Bookings
router.get("/bookings", bookings);
router.patch("/bookings/:id/status", patchBookingStatus);

// Users
router.get("/users", users);

// Hotels
router.post("/hotels", postHotel);
router.patch("/hotels/:id", patchHotel);
router.delete("/hotels/:id", removeHotel);

// Room types
router.post("/rooms", postRoom);
router.patch("/rooms/:id", patchRoom);
router.delete("/rooms/:id", removeRoom);

export default router;