import { z } from "zod";
import {
  getDashboardStats, listAllBookings, listAllUsers, updateBookingStatus,
  createHotel, updateHotel, deleteHotel,
  createRoomType, updateRoomType, deleteRoomType,
} from "../services/admin.service.js";
import {
  bookingListQuerySchema,
  userListQuerySchema,
} from "../utils/admin-query.js";

/* Schemas */
const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CHECKED_IN", "COMPLETED", "CANCELLED"]),
});

const hotelSchema = z.object({
  name: z.string().min(2).max(150),
  slug: z.string().min(2).max(150).regex(/^[a-z0-9-]+$/, "lowercase letters, digits, hyphens only"),
  city: z.string().min(2).max(100),
  address: z.string().min(5).max(255),
  description: z.string().max(2000).optional(),
  rating: z.number().min(0).max(5).optional(),
  priceFrom: z.number().min(0).optional(),
  coverImage: z.string().optional(),
  gallery: z.array(z.string()).optional(),
});

const hotelUpdateSchema = hotelSchema.partial();

const roomSchema = z.object({
  hotelId: z.number().int().positive(),
  name: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  capacity: z.number().int().min(1).max(20).optional(),
  basePrice: z.number().positive(),
  totalRooms: z.number().int().min(1).max(2_147_483_647).optional(),
  imageUrl: z.string().optional(),
});

const roomUpdateSchema = roomSchema.omit({ hotelId: true }).partial();

/* Handlers */
const handleZod = (err, res) =>
  err instanceof z.ZodError
    ? res.status(400).json({ error: err.issues[0].message })
    : null;

export async function stats(req, res, next) {
  try { res.json(await getDashboardStats()); }
  catch (err) { next(err); }
}

export async function bookings(req, res, next) {
  try {
    const query = bookingListQuerySchema.parse(req.query);
    res.json(await listAllBookings(query));
  } catch (err) {
    if (handleZod(err, res)) return;
    next(err);
  }
}

export async function users(req, res, next) {
  try {
    const query = userListQuerySchema.parse(req.query);
    res.json(await listAllUsers(query));
  } catch (err) {
    if (handleZod(err, res)) return;
    next(err);
  }
}

export async function patchBookingStatus(req, res, next) {
  try {
    const { status } = updateStatusSchema.parse(req.body);
    res.json({ booking: await updateBookingStatus(Number(req.params.id), status) });
  } catch (err) {
    if (handleZod(err, res)) return;
    next(err);
  }
}

export async function postHotel(req, res, next) {
  try {
    const data = hotelSchema.parse(req.body);
    res.status(201).json({ hotel: await createHotel(data) });
  } catch (err) {
    if (handleZod(err, res)) return;
    next(err);
  }
}

export async function patchHotel(req, res, next) {
  try {
    const data = hotelUpdateSchema.parse(req.body);
    res.json({ hotel: await updateHotel(Number(req.params.id), data) });
  } catch (err) {
    if (handleZod(err, res)) return;
    next(err);
  }
}

export async function removeHotel(req, res, next) {
  try {
    res.json(await deleteHotel(Number(req.params.id)));
  } catch (err) { next(err); }
}

export async function postRoom(req, res, next) {
  try {
    const data = roomSchema.parse(req.body);
    res.status(201).json({ room: await createRoomType(data) });
  } catch (err) {
    if (handleZod(err, res)) return;
    next(err);
  }
}

export async function patchRoom(req, res, next) {
  try {
    const data = roomUpdateSchema.parse(req.body);
    res.json({ room: await updateRoomType(Number(req.params.id), data) });
  } catch (err) {
    if (handleZod(err, res)) return;
    next(err);
  }
}

export async function removeRoom(req, res, next) {
  try {
    res.json(await deleteRoomType(Number(req.params.id)));
  } catch (err) { next(err); }
}