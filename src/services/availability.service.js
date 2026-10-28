import { pool } from "../config/db.js";
import { getPeakOccupancy } from "../utils/occupancy.js";

/**
 * Returns { total, booked, available } for a room type in a date range.
 * Returns null if the room type doesn't exist.
 */
export async function getAvailability(roomTypeId, checkIn, checkOut) {
  const [roomRows] = await pool.query(
    "SELECT total_rooms FROM room_types WHERE id = ?",
    [roomTypeId]
  );
  if (roomRows.length === 0) return null;

  const [bookings] = await pool.query(
    `SELECT DATE_FORMAT(check_in, '%Y-%m-%d') AS checkIn,
            DATE_FORMAT(check_out, '%Y-%m-%d') AS checkOut
     FROM bookings
     WHERE room_type_id = ?
       AND status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN')
       AND check_in  < ?
       AND check_out > ?`,
    [roomTypeId, checkOut, checkIn]
  );

  const total = roomRows[0].total_rooms;
  const booked = getPeakOccupancy(bookings, checkIn, checkOut);
  return { total, booked, available: Math.max(0, total - booked) };
}