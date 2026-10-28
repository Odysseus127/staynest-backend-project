import { z } from "zod";
import {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
} from "../services/booking.service.js";
import { getAvailability } from "../services/availability.service.js";
import { isValidDateOnly } from "../utils/date.js";

const dateStr = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format")
  .refine(isValidDateOnly, "Use a valid YYYY-MM-DD date");

const dateRange = ({ checkIn, checkOut }) => checkOut > checkIn;
const dateRangeError = {
  message: "Check-out must be after check-in",
  path: ["checkOut"],
};

const createSchema = z.object({
  roomTypeId: z.number().int().positive(),
  checkIn: dateStr,
  checkOut: dateStr,
  guests: z.number().int().positive().default(1),
}).refine(dateRange, dateRangeError);

const availabilitySchema = z.object({
  roomTypeId: z.coerce.number().int().positive(),
  checkIn: dateStr,
  checkOut: dateStr,
}).refine(dateRange, dateRangeError);

export async function create(req, res, next) {
  try {
    const data = createSchema.parse(req.body);
    const booking = await createBooking({ userId: req.user.id, ...data });
    res.status(201).json({ booking });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues[0].message });
    }
    next(err);
  }
}

export async function my(req, res, next) {
  try {
    const bookings = await getUserBookings(req.user.id);
    res.json({ count: bookings.length, bookings });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const booking = await getBookingById(Number(req.params.id), req.user);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json({ booking });
  } catch (err) {
    next(err);
  }
}

export async function cancel(req, res, next) {
  try {
    const result = await cancelBooking(Number(req.params.id), req.user);
    res.json({ booking: result });
  } catch (err) {
    next(err);
  }
}

export async function availability(req, res, next) {
  try {
    const { roomTypeId, checkIn, checkOut } = availabilitySchema.parse(req.query);
    const result = await getAvailability(roomTypeId, checkIn, checkOut);
    if (!result) return res.status(404).json({ error: "Room type not found" });
    res.json({ roomTypeId, checkIn, checkOut, ...result });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues[0].message });
    }
    next(err);
  }
}