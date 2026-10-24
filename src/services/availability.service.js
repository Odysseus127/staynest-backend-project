import { pool } from "../config/db.js";

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

  const [bookedRows] = await pool.query(
    `SELECT COUNT(*) AS booked FROM bookings
     WHERE room_type_id = ?
       AND status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN')
       AND check_in  < ?
       AND check_out > ?`,
    [roomTypeId, checkOut, checkIn]
  );

  const total = roomRows[0].total_rooms;
  const booked = bookedRows[0].booked;
  return { total, booked, available: total - booked };
}