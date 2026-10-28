import { z } from "zod";
import { isValidDateOnly } from "./date.js";

const queryInteger = (minimum, maximum) => z
  .string()
  .regex(/^\d+$/, "Must be a whole number")
  .transform(Number)
  .pipe(z.number().int().min(minimum).max(maximum));
const databaseId = queryInteger(1, 2_147_483_647);
const page = queryInteger(1, 1_000_000).default(1);
const limit = queryInteger(1, 100).default(20);
const dateOnly = z.string().refine(isValidDateOnly, "Use a valid YYYY-MM-DD date");

export const bookingListQuerySchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CHECKED_IN", "COMPLETED", "CANCELLED"]).optional(),
  hotelId: databaseId.optional(),
  userId: databaseId.optional(),
  from: dateOnly.optional(),
  to: dateOnly.optional(),
  page,
  limit,
}).refine(({ from, to }) => !from || !to || from <= to, {
  message: "'from' must be on or before 'to'",
  path: ["to"],
});

export const userListQuerySchema = z.object({
  role: z.enum(["USER", "ADMIN"]).optional(),
  page,
  limit,
});
