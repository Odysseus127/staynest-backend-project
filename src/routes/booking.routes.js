import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  create,
  my,
  getOne,
  cancel,
  availability,
} from "../controllers/booking.controller.js";

const router = Router();

// Public — check availability before login (useful for the UI)
router.get("/availability", availability);

// Protected — everything below requires auth
router.post("/", requireAuth, create);
router.get("/my", requireAuth, my);            // MUST come before /:id
router.get("/:id", requireAuth, getOne);
router.patch("/:id/cancel", requireAuth, cancel);

export default router;